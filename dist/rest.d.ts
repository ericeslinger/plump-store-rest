import { AxiosInstance } from 'axios';
import { Storage, StorageOptions, IndefiniteModelData, ModelData, ModelReference, TerminalStore } from 'plump';
export declare class RestStore extends Storage implements TerminalStore {
    private axios;
    constructor(opts: StorageOptions & {
        baseUrl?: string;
        axios?: AxiosInstance;
    });
    writeAttributes(value: IndefiniteModelData): Promise<ModelData>;
    readAttributes(item: ModelReference): Promise<ModelData>;
    readRelationship(value: ModelReference, relName: string): Promise<ModelData>;
    writeRelationshipItem(value: ModelReference, relName: string, child: {
        id: string | number;
    }): Promise<ModelData>;
    deleteRelationshipItem(value: ModelReference, relName: string, child: {
        id: string | number;
    }): Promise<ModelData>;
    delete(value: ModelReference): Promise<void>;
    query(q: any): any;
}
