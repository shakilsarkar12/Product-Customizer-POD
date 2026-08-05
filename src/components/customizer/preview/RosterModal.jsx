"use client";

import React, { useState } from "react";
import { FiUsers, FiX, FiPlus, FiTrash2, FiCheckCircle } from "react-icons/fi";

export default function RosterModal({ isOpen, onClose, onApplyRoster }) {
  const [players, setPlayers] = useState([
    { name: "SHAKIL", number: "10", size: "L" },
    { name: "RAHIM", number: "07", size: "M" },
  ]);

  if (!isOpen) return null;

  const handleAddPlayer = () => {
    setPlayers((prev) => [...prev, { name: "", number: "", size: "L" }]);
  };

  const handleUpdatePlayer = (index, field, value) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleRemovePlayer = (index) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (onApplyRoster) onApplyRoster(players);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-99999 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative flex flex-col border border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-extrabold text-gray-800 dark:text-white flex items-center gap-2 mb-1">
          <FiUsers className="w-5 h-5 text-brand-500" /> Team Jersey Roster Personalization
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Add names & numbers for your team members. We will automatically print custom details for each shirt.
        </p>

        {/* Roster Table */}
        <div className="max-h-64 overflow-y-auto flex flex-col gap-2 mb-4 p-1">
          {players.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-mono font-bold text-gray-400 w-6">#{idx + 1}</span>
              <input
                type="text"
                placeholder="Player Name"
                value={p.name}
                onChange={(e) => handleUpdatePlayer(idx, "name", e.target.value)}
                className="flex-1 py-1.5 px-3 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white uppercase font-bold"
              />
              <input
                type="text"
                placeholder="No."
                value={p.number}
                onChange={(e) => handleUpdatePlayer(idx, "number", e.target.value)}
                className="w-16 py-1.5 px-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white text-center font-extrabold"
              />
              <select
                value={p.size}
                onChange={(e) => handleUpdatePlayer(idx, "size", e.target.value)}
                className="w-16 py-1.5 px-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg dark:text-white font-bold"
              >
                {["S", "M", "L", "XL", "2XL"].map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleRemovePlayer(idx)}
                className="p-1.5 text-gray-400 hover:text-red-500"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddPlayer}
          className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 mb-4"
        >
          <FiPlus className="w-4 h-4" /> Add Team Member
        </button>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="py-2 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="py-2 px-4 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-1.5"
          >
            <FiCheckCircle className="w-4 h-4" /> Save Team Roster ({players.length} items)
          </button>
        </div>
      </div>
    </div>
  );
}
