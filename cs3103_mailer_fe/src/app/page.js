"use client";
import React, { useState } from "react";
import { Upload, Send } from "lucide-react";

const EmailSendPage = () => {
    const [department, setDepartment] = useState("");
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setAlert(null);

        try {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
            setAlert({
                type: "success",
                message: `Emails sent to ${department} department.`,
            });
        } catch (error) {
            setAlert({
                type: "error",
                message: "Failed to send emails. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Send Emails
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="department"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Department
                    </label>
                    <input
                        id="department"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         dark:focus:ring-blue-400 dark:focus:border-blue-400"
                        placeholder="Enter department name or 'all'"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label
                        htmlFor="file"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Upload CSV File
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            id="file"
                            type="file"
                            // accept=".csv"
                            accept="csv"
                            onChange={handleFileChange}
                            required
                            className="hidden"
                        />
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium 
                           text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 
                           hover:bg-gray-50 dark:hover:bg-gray-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            onClick={() =>
                                document.getElementById("file").click()
                            }
                        >
                            <Upload className="inline-block mr-2 h-4 w-4" />{" "}
                            Choose File
                        </button>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {file ? file.name : "No file chosen"}
                        </span>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
                        text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400
                        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {isLoading ? (
                        "Processing..."
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" /> Send Emails
                        </>
                    )}
                </button>
            </form>
            {alert && (
                <div
                    className={`mt-4 p-4 rounded-md ${
                        alert.type === "error"
                            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100"
                            : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100"
                    }`}
                >
                    <p className="text-sm font-medium">{alert.message}</p>
                </div>
            )}
        </div>
    );
};

export default EmailSendPage;
