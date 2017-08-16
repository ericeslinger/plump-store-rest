import { AxiosInstance } from 'axios';
import { Storage, StorageOptions, IndefiniteModelData, ModelData, ModelReference, TerminalStore } from 'plump';
export interface RestOptions extends StorageOptions {
    baseURL?: string;
    axios?: AxiosInstance;
    socketURL?: string;
    apiKey?: string;
}
export declare class RestStore extends Storage implements TerminalStore {
    axios: AxiosInstance;
    io: SocketIOClient.Socket;
    private options;
    private _dispatching;
    constructor(opts: RestOptions);
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
    query(type: string, q: any): Promise<any>;
}
