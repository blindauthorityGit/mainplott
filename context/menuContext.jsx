import { createContext, useContext, useEffect, useState } from "react";
import client from "../client"; // Import your Sanity client

// Create a context
const MenuContext = createContext();

// Export a hook to use the menu data
export const useMenu = () => useContext(MenuContext);

// Menu provider that fetches and provides the menu data
export function MenuProvider({ children }) {
    const [menuData, setMenuData] = useState(null);

    useEffect(() => {
        console.log("TEST");
        const fetchMenu = async () => {
            try {
                const query = `*[_type == "settingsSingleton"][0]`;
                const data = await client.fetch(query);
                console.log("Fetched data:", data);
                setMenuData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchMenu();
    }, []);

    return <MenuContext.Provider value={menuData}>{children}</MenuContext.Provider>;
}
