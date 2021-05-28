import { createStore, applyMiddleware, compose } from 'redux'
import { createLogger } from 'redux-logger'
import rootReducer from './reducers'

/**
 * CONFIGURE STORE
 * The Store will almost serve as a client side database
 * It will update the State and load data
 * Monitore for any changes and reflect accordingly 
 * Use middleware to debug?
 * Alot of middleware already for free with reduc
 * https://dappuniversity.teachable.com/courses/549171/lectures/10011987
 * https://redux.js.org/introduction/core-concepts
 */

//Middleware setup that helps us catch changes we make. 
const loggerMiddleware = createLogger()
const middleware = []

// For Redux Dev Tools 
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default function configureStore(preloadedState) {//<= Default Settings for redux?
    return createStore(
        rootReducer,//Loads our reducers from ./reducers
        preloadedState,
        composeEnhancers(applyMiddleware(...middleware, loggerMiddleware))
    )

}

