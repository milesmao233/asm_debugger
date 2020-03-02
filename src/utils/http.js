import axios from 'axios'
import {config} from '../config/config'
import qs from 'qs'

export class Http {
    static async request({ url, data, method = 'GET' }) {
        let res
        let m = method.toLowerCase()
        if (m === 'post') {
            const c = {
                url: `${config.apiBaseUrl}${url}`,
                data,
                method
            }
            c.data = qs.stringify(c.data)
            res = await axios.request(c)
        } else {
            const c = {
                url: `${config.apiBaseUrl}${url}`,
                method
            }
            res = await axios.request(c)
        }
        return res.data
    }
}