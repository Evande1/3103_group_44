"use client";
import React, { useState, useEffect } from "react";
import { Eye, Users, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

const JobsTablePage = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Simulate fetching jobs from an API
        const fetchJobs = async () => {
            setIsLoading(true);
            try {
                // Replace this with actual API call
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const mockJobs = [
                    {
                        id: 1,
                        fileName: "employees.csv", 
                        department: "HR",
                        viewCount: 15,
                        totalCount: 50,
                    },
                    {
                        id: 2,
                        fileName: "customers.csv",
                        department: "Sales",
                        viewCount: 30,
                        totalCount: 100,
                    },
                    {
                        id: 3,
                        fileName: "inventory.csv",
                        department: "Logistics",
                        viewCount: 5,
                        totalCount: 75,
                    },
                ];
                setJobs(mockJobs);
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleViewReport = (jobId) => {
        router.push(`/jobs/${jobId}`);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Jobs Dashboard
            </h1>
            {isLoading ? (
                <p className="text-gray-700 dark:text-gray-300">
                    Loading jobs...
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Job ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    File Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    View Count
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Total Count
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {jobs.map((job) => (
                                <tr
                                    key={job.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {job.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {job.fileName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {job.department}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        <span className="flex items-center">
                                            <Eye className="mr-2 h-4 w-4" />
                                            {job.viewCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        <span className="flex items-center">
                                            <Users className="mr-2 h-4 w-4" />
                                            {job.totalCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        <button
                                            onClick={() =>
                                                handleViewReport(job.id)
                                            }
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            View Report
                                        </button>{" "}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default JobsTablePage;
