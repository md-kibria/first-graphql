const expres = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt
} = require('graphql')

const app = expres()


// const schema = new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name: 'HelloWorld',
//         description: 'This is a Wello World output query',
//         fields: () => ({
//             message: {
//                 type: GraphQLString,
//                 resolve: () => 'Hello World'
//             }
//         })
//     })
// })

const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Weeks' }
]

const books = [
    { id: 1, name: 'Harry Potter and the Chancer of Secrets', authorId: 1 },
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
    { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
    { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
    { id: 5, name: 'The Tow Towers', authorId: 2 },
    { id: 6, name: 'The Return of The King', authorId: 2 },
    { id: 7, name: 'The Way of Shadows', authorId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3 },
]

// author type
const AuthorType = new GraphQLObjectType({
    name: 'AuthorType',
    description: 'This is author type',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLInt)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

// book type
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This book type',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLInt)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        authorId: {type: new GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

// root query type
const RootQueryType = new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Root query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'Single Book',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of All Books',
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: 'Single Author',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'All Authors',
            resolve: () => authors
        }
    })
})

// root mutation type
const RootMutationType = new GraphQLObjectType({
    name: 'RootMutaitonType',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: new GraphQLNonNull(BookType),
            description: 'Add A Book',
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }

                books.push(book)

                return book
            }
        },
        addAuthor: {
            type: new GraphQLNonNull(AuthorType),
            description: 'Add A Author',
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name
                }

                authors.push(author)

                return author
            }
        }
    })
})

// schema
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

// graphql router
app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))

// root router
app.get('/', (req, res) => {
    res.end('path is \'/graphql\'')
})

app.listen(4000, () => console.log('App is running on port 4000'))