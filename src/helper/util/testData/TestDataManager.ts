import path from "path";

export class TestDataManager {
    static loadTestData<T>(fileName: string): T {
        const filePath = path.join(__dirname, 'data', fileName);
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
}