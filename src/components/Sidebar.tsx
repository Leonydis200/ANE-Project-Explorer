import React from 'react';
import { Bookmark, Search, Moon, Sun, Star } from 'lucide-react';
import { modules } from '../config/modules';

interface SidebarProps {
  modules: typeof modules;
  favorites: Record<string, boolean>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  activeModule: string;
  setActiveModule: (key: string) => void;
  toggleFavorite: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  modules,
  favorites,
  searchTerm,
  setSearchTerm,
  showFavoritesOnly,
  setShowFavoritesOnly,
  isDarkMode,
  toggleDarkMode,
  activeModule,
  setActiveModule,
  toggleFavorite
}) => {
  const filteredModules = Object.entries(modules).filter(([key, module]) => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const isFav = favorites[key];
    return matchesSearch && (!showFavoritesOnly || isFav);
  });

  return (
    <div className="w-full lg:w-72 xl:w-80 space-y-6">
      <div className={`rounded-2xl shadow-xl p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
        <header className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ANE Modules
          </h2>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search modules..."
            className={`w-full px-4 py-2 pl-10 rounded-lg text-sm border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 focus:ring-blue-500 text-white'
                : 'bg-white border-gray-300 focus:ring-blue-500 text-gray-900'
            } focus:outline-none focus:ring-2`}
            aria-label="Search modules"
          />
          <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center text-sm w-full justify-center py-2 rounded-lg transition-colors ${
            showFavoritesOnly
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              : isDarkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-500 hover:bg-gray-100'
          }`}
          aria-pressed={showFavoritesOnly}
        >
          <Star className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          Show Favorites Only
        </button>
      </div>

      <div className={`rounded-2xl shadow-xl p-5 overflow-y-auto max-h-[75vh] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {filteredModules.length === 0 ? (
          <div className={`text-center py-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No modules found
          </div>
        ) : (
          <ul className="space-y-3" role="tablist">
            {filteredModules.map(([key, module]) => (
              <li key={key}>
                <button
                  role="tab"
                  aria-selected={activeModule === key}
                  tabIndex={0}
                  onClick={() => setActiveModule(key)}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveModule(key)}
                  className={`w-full flex items-center justify-between space-x-3 px-4 py-3 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    activeModule === key
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 ring-2 ring-blue-300 dark:ring-blue-700'
                      : isDarkMode
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className={`p-2 rounded-xl ${module.color} text-white shrink-0`}>
                      {module.icon}
                    </div>
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {module.title}
                      </span>
                      <span className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {module.description}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(key);
                    }}
                    aria-label={favorites[key] ? 'Remove from favorites' : 'Add to favorites'}
                    className={`p-1 rounded-full transition-colors ${
                      favorites[key]
                        ? 'text-yellow-500 hover:text-yellow-600'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-yellow-400'
                          : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" fill={favorites[key] ? 'currentColor' : 'none'} />
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className={`mt-4 text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
