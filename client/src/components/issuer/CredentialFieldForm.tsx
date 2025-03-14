// src/components/Issuer/CredentialFieldForm.tsx
import { Plus, Trash2 } from 'lucide-react';
import { FormField } from '../../types';

export const CredentialFieldForm = ({
    fields,
    updateField,
    removeField,
    addField,
}: {
    fields: FormField[];
    updateField: (index: number, type: 'key' | 'value' | 'isMandatory', value: string | boolean) => void;
    removeField: (index: number) => void;
    addField: () => void;
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Credential Fields
            </label>
            {fields.map((field, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                        type="text"
                        placeholder="Field Name (e.g., Name)"
                        value={field.key}
                        onChange={(e) => updateField(index, 'key', e.target.value)}
                        className="input-field flex-1"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Value (e.g., John Doe)"
                        value={field.value}
                        onChange={(e) => updateField(index, 'value', e.target.value)}
                        className="input-field flex-1"
                        required
                    />
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={field.isMandatory}
                            onChange={(e) => updateField(index, 'isMandatory', e.target.checked)}
                            className="mr-2"
                        />
                        Mandatory
                    </label>
                    {fields.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={addField}
                className="mt-2 flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
                <Plus className="w-5 h-5 mr-1" />
                Add Field
            </button>
        </div>
    );
};