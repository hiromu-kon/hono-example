import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { UnauthorizedException } from './utils/exceptions/unauthorized-exception';
import { zValidator } from '@hono/zod-validator';
import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";

const routeQuery = z.object({
  searchParam: z.string().optional(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
}).openapi("ListQuestionQuery");

const route = createRoute({
  method: "get",
  path: "/",
  request: { 
    query: routeQuery,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            offset: z.number(),
            count: z.number(),
            items: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                status: z.string(),
                createdAt: z.string().datetime(),
              }),
            ),
          }),
        },
      },
      description: "Retrive todos list",
    },
  },
});

const app = new OpenAPIHono();

app.use(logger())
app.get('/', (c) => {
  throw new UnauthorizedException();
  return c.text('Hello Hono!');
})

app.get('/:id', (c) => {
  console.log(c.req.param('id'));
  return c.text('Hello Hono!')
})

app.post('/', (c) => {
  return c.text('Post Hello Hono!');
})

const schema = z.object({
  name: z.string({ required_error: '名前は必須です。' }),
  age: z.string().optional(),
})

app.post(
  '/posts',
  zValidator('query', schema, (result, c) => {
    if (!result.success) {
      console.log(result.error.flatten().fieldErrors);
      return c.json({
        code: 400,
        messages: result.error.flatten().fieldErrors,
      });
    }
  }),
  (c) => {
    const { name, age } = c.req.valid('query');
    return c.text('Post Hello Hono!') 
  }
);

app.notFound((c) => {
  return c.json({
    code: 404,
    message: 'Custom 404 message',
  })
});

app.openapi(route, (c) => {
  const query = c.req.valid('query');
  return c.json({
    offset: query.offset ?? 0,
    count: 0,
    items: [],
  });
});

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
