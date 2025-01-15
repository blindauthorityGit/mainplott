// components/shop/topBarFilter.js

import React from "react";
import { FiSearch } from "react-icons/fi";

export default function TopBarFilter({
    selectedCats,
    selectedTags,
    totalCount,
    onRemoveCat,
    onRemoveTag,
    sortOption,
    setSortOption,
    searchTerm,
    setSearchTerm,
}) {
    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const hasFilters = !(selectedCats.length === 1 && selectedCats[0] === "all" && selectedTags.length === 0);

    return (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4 font-body pt-4">
            {/* Left side: active filters + total count */}
            <div className="flex flex-wrap items-center gap-2 hidden lg:flex">
                {hasFilters && (
                    <>
                        <span className="font-semibold">Aktive Filter:</span>
                        {selectedCats
                            .filter((c) => c.toLowerCase() !== "all")
                            .map((c) => (
                                <div
                                    key={c}
                                    className="flex items-center px-2 py-1 bg-primaryColor-200 rounded-full text-sm"
                                >
                                    {c}
                                    <button
                                        className="ml-2 text-red-500 hover:text-red-700"
                                        onClick={() => onRemoveCat(c)}
                                    >
                                        x
                                    </button>
                                </div>
                            ))}
                        {selectedTags.map((t) => (
                            <div key={t} className="flex items-center px-2 py-1 bg-accentColor rounded-full text-sm">
                                {t}
                                <button className="ml-2 text-red-500 hover:text-red-700" onClick={() => onRemoveTag(t)}>
                                    x
                                </button>
                            </div>
                        ))}
                    </>
                )}
                <span className="text-sm text-gray-600 ml-2">Produkte: {totalCount}</span>
            </div>

            {/* Right side: search + sort */}
            <div className="flex flex-col lg:flex-row items-center gap-8 w-full lg:w-auto">
                {/* Search input with icon */}
                <div className="relative w-full max-w-xs">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                        <FiSearch className="text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Suche..."
                        className="w-full border border-gray-300 rounded-full pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primaryColor-200 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="sort" className="text-sm font-semibold">
                        Sortieren nach:
                    </label>
                    <select
                        id="sort"
                        className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring focus:ring-primaryColor-200"
                        value={sortOption}
                        onChange={handleSortChange}
                    >
                        <option value="name">Name</option>
                        <option value="price">Preis</option>
                        <option value="collection">Kollektion</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
