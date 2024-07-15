import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CsvDataDisplay = () => {
    const [csvData, setCsvData] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [sort, setSort] = useState("expiration_date");
    const [order, setOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchData();
    }, [perPage, sort, order, currentPage]);

    const fetchData = () => {
        axios
            .get("/csv-data", {
                params: {
                    per_page: perPage,
                    sort: sort,
                    order: order,
                    page: currentPage,
                },
            })
            .then((response) => {
                setCsvData(response.data.data);
                setTotalPages(response.data.last_page);
            })
            .catch((error) => {
                console.error("Error fetching CSV data:", error);
                toast.error("Failed to fetch CSV data");
            });
    };

    const handlePerPageChange = (e) => {
        setPerPage(e.target.value);
        setCurrentPage(1); // Reset to first page
    };

    const handleSortFieldChange = (e) => {
        setSort(e.target.value);
        setCurrentPage(1); // Reset to first page
    };

    const handleSortOrderChange = (e) => {
        setOrder(e.target.value);
        setCurrentPage(1); // Reset to first page
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleSendEmail = (id) => {
        axios
            .post(`/send-reminder/${id}`)
            .then((response) => {
                toast.success("Reminder email sent successfully.");
            })
            .catch((error) => {
                console.error("Error sending reminder email:", error);
                toast.error("Failed to send reminder email.");
            });
    };

    const handleDeleteAll = () => {
        if (window.confirm("Are you sure you want to delete all data?")) {
            axios
                .delete("/delete-all")
                .then((response) => {
                    toast.success("All data deleted successfully.");
                    fetchData(); // Refresh the data after deletion
                })
                .catch((error) => {
                    console.error("Error deleting data:", error);
                    toast.error("Failed to delete data.");
                });
        }
    };

    if (csvData.length === 0) {
        return (
            <div className="p-4">
                <ToastContainer />
                <h3 className="text-lg font-semibold mb-4">CSV Data</h3>
                <p className="text-gray-600 text-center font-semibold text-xl my-8">
                    No data available. Please upload a CSV file.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <ToastContainer />
            <h3 className="text-lg font-semibold mb-4">CSV Data</h3>
            <div className="mb-4 flex items-center space-x-4">
                <div>
                    <label className="mr-2">Items per page:</label>
                    <select
                        value={perPage}
                        onChange={handlePerPageChange}
                        className="border p-2 pr-8"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                </div>
                <div>
                    <label className="mr-2">Sort by:</label>
                    <select
                        value={sort}
                        onChange={handleSortFieldChange}
                        className="border p-2 pr-8"
                    >
                        <option value="title">Title</option>
                        <option value="type">Type</option>
                        <option value="expiration_date">Expiration Date</option>
                    </select>
                </div>
                <div>
                    <label className="mr-2">Order:</label>
                    <select
                        value={order}
                        onChange={handleSortOrderChange}
                        className="border p-2 pr-8"
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
                <div className="!ml-auto">
                    <button
                        onClick={handleDeleteAll}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                    >
                        Delete All Data
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="table-fixed min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="w-1/5 py-2 px-4 border-b">Title</th>
                            <th className="w-1/5 py-2 px-4 border-b">Type</th>
                            <th className="w-1/5 py-2 px-4 border-b">
                                Expiration Date
                            </th>
                            <th className="w-1/5 py-2 px-4 border-b">Status</th>
                            <th className="w-1/5 py-2 px-4 border-b">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {csvData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border-b text-center">
                                    {item.title}
                                </td>
                                <td className="py-2 px-4 border-b text-center">
                                    {item.type}
                                </td>
                                <td className="py-2 px-4 border-b text-center">
                                    {item.expiration_date}
                                </td>
                                <td
                                    className={`py-2 px-4 border-b text-center ${
                                        item.status === "Expired"
                                            ? "text-red-500"
                                            : item.status === "Soon to expire"
                                            ? "text-yellow-500"
                                            : "text-green-500"
                                    }`}
                                >
                                    {item.status}
                                </td>
                                <td className="py-2 px-4 border-b text-center">
                                    <button
                                        onClick={() => handleSendEmail(item.id)}
                                        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 ${
                                            item.status === "Expired"
                                                ? "disabled:opacity-50"
                                                : ""
                                        }`}
                                        disabled={item.status === "Expired"}
                                    >
                                        Send Reminder
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-4">
                <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default CsvDataDisplay;
