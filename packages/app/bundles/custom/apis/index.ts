import {Protofy} from 'protolib/base'
import vibezapiApi from "./vibezapi";

const autoApis = Protofy("apis", {
    vibezapi: vibezapiApi
})

export default (app, context) => {
    Object.keys(autoApis).forEach((k) => {
        autoApis[k](app, context)
    })
}