/**
 * Relational shapes for Yatraverse mock tables. Swap services for a real API later.
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} avatar
 * @property {string} language
 * @property {string} currency
 * @property {'traveller'|'admin'} role
 * @property {string} created_at
 * @property {string} [persona]
 * @property {string} [password]
 * @property {boolean} [suspended]
 *
 * @typedef {Object} City
 * @property {string} id
 * @property {string} name
 * @property {string} country
 * @property {'Asia'|'Europe'|'Americas'|'Africa'|'Oceania'} region
 * @property {number} lat
 * @property {number} lng
 * @property {number} cost_index
 * @property {number} popularity
 * @property {string} image
 * @property {string} description
 * @property {string} best_season
 * @property {string} iata
 *
 * @typedef {Object} Trip
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {string} description
 * @property {string} start_date
 * @property {string} end_date
 * @property {string} cover_url
 * @property {boolean} is_public
 * @property {string} share_slug
 * @property {string} created_at
 * @property {number} [budget_cap]
 * @property {string[]} [collaborators]
 * @property {string} [notes]
 *
 * @typedef {Object} Stop
 * @property {string} id
 * @property {string} trip_id
 * @property {string} city_id
 * @property {number} order_index
 * @property {string} start_date
 * @property {string} end_date
 *
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} city_id
 * @property {string} name
 * @property {'sightseeing'|'food'|'adventure'|'culture'|'nightlife'|'wellness'} type
 * @property {number} cost
 * @property {number} duration_min
 * @property {string} image
 * @property {string} description
 * @property {number} rating
 *
 * @typedef {Object} StopActivity
 * @property {string} id
 * @property {string} stop_id
 * @property {string} activity_id
 * @property {string} day_date
 * @property {string} start_time
 * @property {number} order_index
 * @property {number} [cost_override]
 * @property {string} [notes]
 * @property {number} [votes]
 *
 * @typedef {Object} Expense
 * @property {string} id
 * @property {string} trip_id
 * @property {'transport'|'stay'|'activities'|'meals'} category
 * @property {number} amount
 * @property {string} date
 *
 * @typedef {Object} SavedDestination
 * @property {string} user_id
 * @property {string} city_id
 *
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {string} role
 * @property {string} content
 * @property {object} [card]
 *
 * @typedef {Object} AIProvider
 * @property {(input: object) => AsyncGenerator<string>} generateItinerary
 * @property {(trip: object) => Promise<object[]>} optimizeTrip
 * @property {(messages: ChatMessage[], context: object) => AsyncGenerator<string>} chat
 */

export const ACTIVITY_TYPES = ['sightseeing', 'food', 'adventure', 'culture', 'nightlife', 'wellness'];
export const EXPENSE_CATEGORIES = ['transport', 'stay', 'activities', 'meals'];
