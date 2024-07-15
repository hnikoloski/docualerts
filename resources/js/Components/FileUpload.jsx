import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";

const FileUpload = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("file", file);

        Inertia.post("/csv-data", formData, {
            onSuccess: () => {
                alert("File uploaded successfully.");
            },
            onError: (errors) => {
                alert("Error uploading file.");
            },
        });
    };

    return (
        <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-center">
                Upload CSV File
            </h2>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center space-y-4"
            >
                <div className="w-full flex justify-center">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".csv"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 w-fit"
                    />
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200 disabled:opacity-25 transition"
                >
                    Upload
                </button>
            </form>
        </div>
    );
};

export default FileUpload;
