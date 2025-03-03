import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, Plus, MoreVertical } from "lucide-react";

export function Features() {
  const [folders, setFolders] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showMenu, setShowMenu] = useState(null);
  const [renameFolder, setRenameFolder] = useState({ index: null, name: "" });

  const navigate = useNavigate();

  // Load folders from localStorage on component mount
  useEffect(() => {
    const savedFolders = JSON.parse(localStorage.getItem("folders")) || [];
    setFolders(savedFolders);
  }, []);

  // Save folders to localStorage whenever they change
  const updateLocalStorage = (updatedFolders) => {
    localStorage.setItem("folders", JSON.stringify(updatedFolders));
  };

  // Create Folder
  const createFolder = () => {
    if (folderName.trim()) {
      const newFolders = [...folders, { name: folderName, files: [] }];
      setFolders(newFolders);
      updateLocalStorage(newFolders);
      setFolderName("");
      setShowPopup(false);
    }
  };

  // Open Folder
  const openFolder = (folderName) => {
    navigate(`/folder/${folderName}`);
  };

  // Delete Folder (only when user confirms)
  const deleteFolder = (index) => {
    const confirmed = window.confirm("Are you sure you want to delete this folder?");
    if (confirmed) {
      const updatedFolders = folders.filter((_, i) => i !== index);
      setFolders(updatedFolders);
      updateLocalStorage(updatedFolders);
      setShowMenu(null);
    }
  };

  // Rename Folder
  const renameFolderHandler = () => {
    if (renameFolder.name.trim()) {
      const updatedFolders = [...folders];
      updatedFolders[renameFolder.index].name = renameFolder.name;
      setFolders(updatedFolders);
      updateLocalStorage(updatedFolders);
      setRenameFolder({ index: null, name: "" });
      setShowMenu(null);
    }
  };

  return (
    <div className="page-transition pt-16 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-200 dark:bg-gray-800 p-4 fixed h-[65vh] left-10 top-[17.5vh] rounded-lg shadow-lg flex flex-col justify-between">
        <button
          onClick={() => setShowPopup(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center w-full"
        >
          <Plus className="w-5 h-5 mr-2" /> New Folder
        </button>
      </aside>

      {/* Main Content */}
      <section className="flex-1 py-16 bg-gray-100 dark:bg-gray-900 px-8 ml-80">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Your Drive</h1>
          <div className="grid grid-cols-4 gap-6 mt-8">
            {folders.map((folder, index) => (
              <div key={index} className="relative flex items-center p-3 border rounded-lg cursor-pointer bg-white dark:bg-gray-800 shadow-md">
                {/* Folder Icon */}
                <div onClick={() => openFolder(folder.name)} className="flex items-center gap-1 flex-1">
                  <Folder className="w-10 h-6 text-blue-500" />
                  <p className="font-medium">{folder.name}</p>
                </div>

                {/* Three-dot Menu Button */}
                <button
                  className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(showMenu === index ? null : index);
                  }}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {/* Folder Options Menu */}
                {showMenu === index && (
                  <div className="absolute right-2 top-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2">
                    <button
                      className="block px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 w-full text-left"
                      onClick={() => setRenameFolder({ index, name: folder.name })}
                    >
                      Rename
                    </button>
                    <button
                      className="block px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 w-full text-left text-red-500"
                      onClick={() => deleteFolder(index)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Folder Creation Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Create New Folder</h2>
            <input
              type="text"
              placeholder="Folder Name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="border p-2 text-black rounded w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPopup(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">
                Cancel
              </button>
              <button onClick={createFolder} className="px-4 py-2 bg-blue-500 text-gray-800 rounded">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Folder Popup */}
      {renameFolder.index !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Rename Folder</h2>
            <input
              type="text"
              placeholder="New Folder Name"
              value={renameFolder.name}
              onChange={(e) => setRenameFolder({ ...renameFolder, name: e.target.value })}
              className="border p-2 text-black rounded w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRenameFolder({ index: null, name: "" })} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">
                Cancel
              </button>
              <button onClick={renameFolderHandler} className="px-4 py-2 bg-blue-500 text-gray-800 rounded">
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
