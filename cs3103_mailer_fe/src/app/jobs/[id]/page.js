"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Eye,
    Users,
    Mail,
    Calendar,
    Clock,
    FileText,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const SingleJobReportPage = ({ params }) => {
    const router = useRouter();
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedDepartments, setExpandedDepartments] = useState({});
    const id = params.id;

    console.log(params);
    useEffect(() => {
        if (id) {
            fetchJobData(id);
        }
    }, [id]);

    const fetchJobData = async (jobId) => {
        setIsLoading(true);
        try {
            // Replace this with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const mockJob = {
                id: jobId,
                fileName: "employees.csv",
                department: "All",
                viewCount: 15,
                totalCount: 50,
                createdAt: "2023-10-20T14:30:00Z",
                status: "Completed",
                departmentBreakdown: [
                    {
                        name: "HR",
                        count: 20,
                        emails: [
                            "hr1@example.com",
                            "hr2@example.com",
                            "hr3@example.com",
                        ],
                    },
                    {
                        name: "Sales",
                        count: 15,
                        emails: ["sales1@example.com", "sales2@example.com"],
                    },
                    {
                        name: "Engineering",
                        count: 15,
                        emails: [
                            "eng1@example.com",
                            "eng2@example.com",
                            "eng3@example.com",
                        ],
                    },
                ],
            };
            setJob(mockJob);
        } catch (error) {
            console.error("Failed to fetch job data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDepartmentExpansion = (departmentName) => {
        setExpandedDepartments((prev) => ({
            ...prev,
            [departmentName]: !prev[departmentName],
        }));
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 text-gray-700 dark:text-gray-300">
                Loading job report...
            </div>
        );
    }

    if (!job) {
        return (
            <div className="container mx-auto p-4 text-red-600 dark:text-red-400">
                Job not found
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                Job Report: {job.id}
            </h1>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                        Job Details
                    </h3>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700">
                    <dl>
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 flex items-center">
                                <FileText className="mr-2 h-4 w-4" /> File Name
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                {job.fileName}
                            </dd>
                        </div>
                        <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 flex items-center">
                                <Mail className="mr-2 h-4 w-4" /> Department
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                {job.department}
                            </dd>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 flex items-center">
                                <Eye className="mr-2 h-4 w-4" /> View Count
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                {job.viewCount}
                            </dd>
                        </div>
                        <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 flex items-center">
                                <Users className="mr-2 h-4 w-4" /> Total Count
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                {job.totalCount}
                            </dd>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 flex items-center">
                                <Calendar className="mr-2 h-4 w-4" /> Created At
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                {new Date(job.createdAt).toLocaleString()}
                            </dd>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                                Status
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                                <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        job.status === "Completed"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                    }`}
                                >
                                    {job.status}
                                </span>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                        Department Breakdown
                    </h3>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    Department
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    Count
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >
                                    Emails
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {job.departmentBreakdown.map((dept) => (
                                <React.Fragment key={dept.name}>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {dept.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {dept.count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            <button
                                                onClick={() =>
                                                    toggleDepartmentExpansion(
                                                        dept.name
                                                    )
                                                }
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                            >
                                                {expandedDepartments[
                                                    dept.name
                                                ] ? (
                                                    <ChevronUp className="h-4 w-4 mr-1" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 mr-1" />
                                                )}
                                                {expandedDepartments[dept.name]
                                                    ? "Hide Emails"
                                                    : "Show Emails"}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedDepartments[dept.name] && (
                                        <tr>
                                            <td
                                                colSpan="3"
                                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                                            >
                                                <ul className="list-disc pl-5">
                                                    {dept.emails.map(
                                                        (email, index) => (
                                                            <li key={index}>
                                                                {email}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={() => router.push("/jobs")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                    Back to Jobs List
                </button>
            </div>
        </div>
    );
};

export default SingleJobReportPage;
