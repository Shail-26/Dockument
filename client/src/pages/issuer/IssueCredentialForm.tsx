import React, { useState, FormEvent } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';

interface FormField {
    key: string;
    value: string;
    isMandatory?: boolean;
}

interface IssueCredentialFormProps {
    isSubmitting: boolean;
    isValidReceiver: boolean;
    receiverAddress: string;
    setReceiverAddress: (value: string) => void;
    handleIssueCredential: (e: FormEvent) => Promise<void>;
}

export function IssueCredentialForm({
    isSubmitting,
    isValidReceiver,
    receiverAddress,
    setReceiverAddress,
    handleIssueCredential,
}: IssueCredentialFormProps) {
    const [fields, setFields] = useState<FormField[]>([{ key: '', value: '', isMandatory: false }]);

    const addField = () => {
        setFields([...fields, { key: '', value: '', isMandatory: false }]);
    };

    const updateField = (index: number, type: 'key' | 'value' | 'isMandatory', value: string | boolean) => {
        const updatedFields = fields.map((field, i) =>
            i === index ? { ...field, [type]: value } : field
        );
        setFields(updatedFields);
    };

    const removeField = (index: number) => {
        if (fields.length > 1) {
            setFields(fields.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="card mb-12">
            <h2 className="text-2xl font-bold mb-6">Issue New Credential</h2>
            <form onSubmit={handleIssueCredential} className="space-y-6">
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

                <div>
                    <label
                        htmlFor="receiverAddress"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Receiver Address
                    </label>
                    <input
                        type="text"
                        id="receiverAddress"
                        value={receiverAddress}
                        onChange={(e) => setReceiverAddress(e.target.value)}
                        placeholder="0x..."
                        className={`input-field ${
                            receiverAddress && !isValidReceiver ? 'border-red-500 dark:border-red-400' : ''
                        }`}
                        required
                    />
                    {receiverAddress && !isValidReceiver && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            Please enter a valid Ethereum address
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !isValidReceiver || fields.some((f) => !f.key || !f.value)}
                    className="gradient-btn flex items-center justify-center"
                >
                    {isSubmitting ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Processing...
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5 mr-2" />
                            Issue Credential
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}