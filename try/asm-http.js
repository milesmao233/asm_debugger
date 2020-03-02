import { Http } from "../src/utils/http";

class AsmModel {
    static async all() {
        let path = '/api/all'
        return await Http.request({
            url: path
        })
    }

    static async convert(data) {
        let path = '/api/asm/convert'
        return await Http.request({
            url: path,
            data: data,
            method: 'POST',
        })
    }

    // static async delete(todoId) {
    //     let path = '/todo/delete/' + todoId
    //     return await Http.request({
    //         url: path,
    //     })
    // }

    // static async update(todoId, data) {
    //     let path = '/todo/update/' + todoId
    //     return await Http.request({
    //         url: path,
    //         data,
    //         method: 'POST',
    //     })
    // }
}

export default AsmModel
