import { useState } from 'react';
import type { Node, NodeProps } from '@xyflow/react';

export const FIELD_TYPES = [
  'string',
  'number',
  'boolean',
  'date',
  'json',
  'enum',
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

/**
 * A single field defined inside a model.
 *
 * @remarks
 * The field shape matches the canvas editor contract until the shared exchange
 * format is finalized by the generator work.
 */
export type ModelField = {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  defaultValue: string;
};

/**
 * Data carried by a model node in the canvas.
 *
 * @remarks
 * The model name is shown in the node title and the field list defines the
 * structure we will eventually align with the shared generator contract.
 */
export type ModelNodeData = {
  label: string;
  fields: ModelField[];
};

/**
 * A model block node rendered on the canvas.
 *
 * @remarks
 * The node type is intentionally specific to the canvas feature so the builder
 * can evolve independently from the shared generator schema before the final
 * exchange format is merged.
 */
export type ModelNode = Node<ModelNodeData, 'model'>;

function createField(): ModelField {
  return {
    id: crypto.randomUUID(),
    name: 'newField',
    type: 'string',
    required: false,
    unique: false,
    defaultValue: '',
  };
}

/**
 * Visual editor for a model and its fields.
 *
 * @remarks
 * This is the first editable form for the model block, allowing users to add,
 * remove and configure the fields that the generator will later consume.
 */
export function ModelBlock({ data }: NodeProps<ModelNode>) {
  const [fields, setFields] = useState<ModelField[]>(data.fields);

  function updateField(fieldId: string, changes: Partial<ModelField>) {
    setFields((currentFields) =>
      currentFields.map((field) =>
        field.id === fieldId ? { ...field, ...changes } : field,
      ),
    );
  }

  function addField() {
    setFields((currentFields) => [...currentFields, createField()]);
  }

  function removeField(fieldId: string) {
    setFields((currentFields) =>
      currentFields.filter((field) => field.id !== fieldId),
    );
  }

  return (
    <div
      style={{
        minWidth: '260px',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        background: '#ffffff',
        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '8px 12px',
          fontWeight: 700,
          color: '#0f172a',
        }}
      >
        {data.label}
      </div>

      <div style={{ padding: '8px 12px 12px' }}>
        {fields.length === 0 ? (
          <div style={{ color: '#64748b', padding: '8px 0' }}>
            No fields yet
          </div>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {fields.map((field) => (
              <li
                key={field.id}
                style={{
                  display: 'grid',
                  gap: '8px',
                  padding: '8px 0',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <label
                  style={{ display: 'grid', gap: '4px', fontSize: '12px' }}
                >
                  <span>Field name</span>
                  <input
                    aria-label="Field name"
                    value={field.name}
                    onChange={(event) =>
                      updateField(field.id, { name: event.target.value })
                    }
                    style={{ padding: '6px 8px' }}
                  />
                </label>

                <label
                  style={{ display: 'grid', gap: '4px', fontSize: '12px' }}
                >
                  <span>Field type</span>
                  <select
                    aria-label="Field type"
                    value={field.type}
                    onChange={(event) =>
                      updateField(field.id, {
                        type: event.target.value as FieldType,
                      })
                    }
                    style={{ padding: '6px 8px' }}
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label
                  style={{ display: 'grid', gap: '4px', fontSize: '12px' }}
                >
                  <span>Default</span>
                  <input
                    aria-label="Field default"
                    value={field.defaultValue}
                    onChange={(event) =>
                      updateField(field.id, {
                        defaultValue: event.target.value,
                      })
                    }
                    style={{ padding: '6px 8px' }}
                  />
                </label>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(event) =>
                        updateField(field.id, {
                          required: event.target.checked,
                        })
                      }
                    />
                    Required
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={field.unique}
                      onChange={(event) =>
                        updateField(field.id, { unique: event.target.checked })
                      }
                    />
                    Unique
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => removeField(field.id)}
                  style={{ justifySelf: 'start' }}
                >
                  Remove field
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={addField}
          style={{ marginTop: '8px', width: '100%' }}
        >
          Add field
        </button>
      </div>
    </div>
  );
}
