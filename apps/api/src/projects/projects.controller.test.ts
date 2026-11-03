import 'reflect-metadata';
import type { Project } from '@brume/shared';
import { blogProject, shopProject } from '@brume/shared/fixtures';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module.js';
import { bodyLimit, configureApp } from '../app.setup.js';
import { PrismaService } from '../prisma/prisma.service.js';

const unknownId = '01a1a000-0000-7000-8000-000000000000';

/**
 * Waits until the next write gets a later `updatedAt`, which PostgreSQL
 * stores to the millisecond.
 */
const nextMillisecond = () => new Promise((resolve) => setTimeout(resolve, 5));

describe('/projects', () => {
  let app: NestExpressApplication;
  const createdIds: string[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app
      .get(PrismaService)
      .project.deleteMany({ where: { id: { in: createdIds } } });
    await app.close();
  });

  async function createProject(document: Project) {
    const response = await request(app.getHttpServer())
      .post('/projects')
      .send(document)
      .expect(201);
    createdIds.push(response.body.id);
    return response.body as { id: string; updatedAt: string };
  }

  describe('POST /projects', () => {
    it('saves the project and returns it', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .send(blogProject)
        .expect(201);
      createdIds.push(response.body.id);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: 'Blog',
        document: blogProject,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('rejects an invalid body with 400 and the issues', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .send({ ...blogProject, name: '' })
        .expect(400);

      expect(response.body.issues).toEqual([
        { path: ['name'], message: expect.any(String) },
      ]);
    });

    it('gives the full path of a nested issue', async () => {
      const document = structuredClone(blogProject);
      document.models[0].fields[0].name = '1email';

      const response = await request(app.getHttpServer())
        .post('/projects')
        .send(document)
        .expect(400);

      expect(response.body.issues).toEqual([
        {
          path: ['models', 0, 'fields', 0, 'name'],
          message: expect.any(String),
        },
      ]);
    });

    it('rejects a body over the size limit with 413', async () => {
      const body = JSON.stringify({
        ...blogProject,
        name: 'a'.repeat(bodyLimit),
      });

      await request(app.getHttpServer())
        .post('/projects')
        .set('Content-Type', 'application/json')
        .send(body)
        .expect(413);
    });
  });

  describe('GET /projects', () => {
    it('lists projects without documents, most recently updated first', async () => {
      const blog = await createProject(blogProject);
      const shop = await createProject(shopProject);
      await nextMillisecond();
      await request(app.getHttpServer())
        .put(`/projects/${blog.id}`)
        .send(blogProject)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get('/projects')
        .expect(200);
      const listed = (response.body as { id: string }[]).filter((project) =>
        [blog.id, shop.id].includes(project.id),
      );

      expect(listed).toEqual([
        { id: blog.id, name: blogProject.name, updatedAt: expect.any(String) },
        { id: shop.id, name: shopProject.name, updatedAt: expect.any(String) },
      ]);
    });

    it('lists projects updated at the same time newest first', async () => {
      const older = await createProject(blogProject);
      const newer = await createProject(shopProject);
      await app.get(PrismaService).project.updateMany({
        where: { id: { in: [older.id, newer.id] } },
        data: { updatedAt: new Date('2026-01-01T00:00:00Z') },
      });

      const response = await request(app.getHttpServer())
        .get('/projects')
        .expect(200);
      const listedIds = (response.body as { id: string }[])
        .map((project) => project.id)
        .filter((id) => [older.id, newer.id].includes(id));

      expect(listedIds).toEqual([newer.id, older.id]);
    });
  });

  describe('GET /projects/:id', () => {
    it('returns the project', async () => {
      const { id } = await createProject(blogProject);

      const response = await request(app.getHttpServer())
        .get(`/projects/${id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id,
        name: blogProject.name,
        document: blogProject,
      });
    });

    it('answers 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .get(`/projects/${unknownId}`)
        .expect(404);
    });

    it('answers 400 for an id that is not a uuid', async () => {
      await request(app.getHttpServer()).get('/projects/nope').expect(400);
    });
  });

  describe('PUT /projects/:id', () => {
    it('replaces the document and the name', async () => {
      const { id, updatedAt } = await createProject(blogProject);
      const renamed = { ...blogProject, name: 'Renamed' };
      await nextMillisecond();

      const response = await request(app.getHttpServer())
        .put(`/projects/${id}`)
        .send(renamed)
        .expect(200);

      expect(response.body).toMatchObject({
        id,
        name: 'Renamed',
        document: renamed,
      });
      expect(response.body.updatedAt > updatedAt).toBe(true);
    });

    it('rejects an invalid body with 400 and the issues', async () => {
      const { id } = await createProject(blogProject);

      const response = await request(app.getHttpServer())
        .put(`/projects/${id}`)
        .send({ ...blogProject, version: 2 })
        .expect(400);

      expect(response.body.issues).toEqual([
        { path: ['version'], message: expect.any(String) },
      ]);
    });

    it('answers 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .put(`/projects/${unknownId}`)
        .send(blogProject)
        .expect(404);
    });

    it('answers 400 for an id that is not a uuid', async () => {
      await request(app.getHttpServer())
        .put('/projects/nope')
        .send(blogProject)
        .expect(400);
    });
  });
});
