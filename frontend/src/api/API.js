// import {APIDummy} from "./APIDummy";
import {APIOnline} from "./APIOnline";

export default class API {

    static #initialised = false;
    static #api;

    static init() {
        if (this.#initialised) return;
        
        this.#api = new APIOnline();
        this.#initialised = true;
    }

    static getApi() {
        if (this.#initialised) {
            return this.#api;
        } else {
            return null;
        }
    }
}