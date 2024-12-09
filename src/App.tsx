import './App.css';
import { Input } from "@/components/ui/input.tsx";
import { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import {Button} from "@/components/ui/button.tsx";

function App() {
    const [apiKey, setApiKey] = useState("");
    const [dataCollectionName, setDataCollectionName] = useState("");
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedKey = localStorage.getItem("strapiKey");
        if (storedKey) setApiKey(storedKey);
    }, []);

    const onKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
        const key = e.target.value;
        setApiKey(key);
        localStorage.setItem("strapiKey", key);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCsvFile(file);
        }
    };

    const handleSubmit = async () => {
        if (!csvFile || !dataCollectionName || !apiKey) {
            alert("Заповніть всі поля і виберіть файл.");
            return;
        }

        setLoading(true);

        Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            complete: async (result) => {
                const rows = result.data as Record<string, string>[];

                if (rows.length === 0) {
                    alert("CSV файл порожній або неправильний.");
                    setLoading(false);
                    return;
                }

                for (const row of rows) {
                    try {
                        await axios.post(
                            `http://localhost:1337/api/${dataCollectionName}`,
                            { data: row },
                            {
                                headers: {
                                    Authorization: `Bearer ${apiKey}`,
                                },
                            }
                        );
                        console.log(`Запис додано:`, row);
                    } catch (error) {
                        console.error(`Помилка додавання запису:`, error);
                    }
                }

                setLoading(false);
            },
            error: (error) => {
                console.error("Помилка читання CSV:", error);
                setLoading(false);
            },
        });
    };

    return (
        <section className="container flex flex-col items-center justify-between w-full h-screen max-w-96">
            <h1>Інструкція</h1>
            <h2>Запустити Strapi на localhost:1337</h2>

            <h2>Згенерувати API key і додати сюди</h2>
            <Input
                placeholder="Strapi API key"
                value={apiKey}
                onChange={(e) => onKeyChange(e)}
            />

            <h2>Потрібно створити в Strapi Data Collection і додати її ім'я сюди</h2>
            <Input
                placeholder="Data collection name"
                value={dataCollectionName}
                onChange={(e) => setDataCollectionName(e.target.value)}
            />

            <h2>Додати CSV файл (щоб колонки співпадали з колонками Strapi)</h2>
            <input type="file" accept=".csv" onChange={handleFileChange} />

            <Button
                className=" bg-blue-600 text-white rounded w-full"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Обробка..." : "Імпортувати CSV"}
            </Button>
        </section>
    );
}

export default App;