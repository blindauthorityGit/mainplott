import React from "react";

export default function TopBarFilter({
    selectedCats,
    selectedTags,
    totalCount,
    onRemoveCat,
    onRemoveTag,
    sortOption,
    setSortOption,
}) {
    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const hasFilters = !(selectedCats.length === 1 && selectedCats[0] === "all" && selectedTags.length === 0);

    return (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4 font-body pt-4">
            <div className="flex flex-wrap items-center gap-2">
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
            <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-sm font-semibold">
                    Sortieren nach:
                </label>
                <select
                    id="sort"
                    className="border border-gray-300 rounded p-1 text-sm"
                    value={sortOption}
                    onChange={handleSortChange}
                >
                    <option value="name">Name</option>
                    <option value="price">Preis</option>
                    <option value="collection">Kollektion</option>
                </select>
            </div>
        </div>
    );
}
