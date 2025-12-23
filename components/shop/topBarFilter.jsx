// components/shop/topBarFilter.js
import React from "react";
import { FiSearch, FiX } from "react-icons/fi";

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
    const handleSortChange = (e) => setSortOption(e.target.value);
    const hasFilters = !(selectedCats.length === 1 && selectedCats[0] === "all" && selectedTags.length === 0);

    return (
        <div className="font-body mb-4 pt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: aktive Filter + Count */}
            <div className="hidden lg:flex flex-wrap items-center gap-2">
                {hasFilters && <span className="text-sm font-semibold text-textColor">Aktive Filter:</span>}

                {/* Kategorie-Pills */}
                {selectedCats
                    .filter((c) => c.toLowerCase() !== "all")
                    .map((c) => (
                        <span
                            key={c}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-primaryColor/40 px-2.5 py-1 text-xs text-textColor hover:border-gray-300"
                        >
                            {c}
                            <button
                                type="button"
                                onClick={() => onRemoveCat(c)}
                                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryColor/30"
                                aria-label={`${c} entfernen`}
                                title="Entfernen"
                            >
                                <FiX className="h-3 w-3" />
                            </button>
                        </span>
                    ))}

                {/* Subtag-Pills */}
                {selectedTags.map((t) => (
                    <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full border border-accentColor/30 bg-accentColor/70 px-2.5 py-1 text-xs text-textColor hover:border-accentColor/50"
                    >
                        {t}
                        <button
                            type="button"
                            onClick={() => onRemoveTag(t)}
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-textColor/70 hover:bg-accentColor/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryColor/30"
                            aria-label={`${t} entfernen`}
                            title="Entfernen"
                        >
                            <FiX className="h-3 w-3" />
                        </button>
                    </span>
                ))}

                <span className="ml-2 text-xs text-gray-600">Produkte: {totalCount}</span>
            </div>

            {/* Right: Suche + Sortierung */}
            <div className="flex w-full flex-col items-stretch gap-3 lg:w-auto lg:flex-row lg:items-center lg:gap-6">
                {/* Search */}
                <div className="relative w-full max-w-xs">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                        <FiSearch className="text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Suche..."
                        className="w-full rounded-full border border-gray-200 bg-white pl-8 pr-8 py-2 text-sm text-textColor placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primaryColor/20 transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm ? (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-0 mr-2 flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaryColor/30"
                            aria-label="Suche löschen"
                            title="Löschen"
                        >
                            <FiX className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="text-xs font-semibold text-textColor">
                        Sortieren nach:
                    </label>
                    <select
                        id="sort"
                        className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-textColor focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primaryColor/20"
                        value={sortOption}
                        onChange={handleSortChange}
                    >
                        <option value="name">Name</option>
                        <option value="price">Preis</option>
                        <option value="collection">Kollektion</option>
                    </select>
                </div>

                {/* On mobile: Count separat zeigen */}
                <div className="lg:hidden text-xs text-gray-600">Produkte: {totalCount}</div>
            </div>
        </div>
    );
}
