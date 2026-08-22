import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { postId, name, email, content } = await req.json();

  const mutation = `
    mutation AddComment(
      $postId: Int!
      $content: String!
      $author: String!
      $email: String!
    ) {
      createComment(
        input: {
          commentOn: $postId
          content: $content
          author: $author
          authorEmail: $email
        }
      ) {
        success
      }
    }
  `;

  const res = await fetch(process.env.WORDPRESS_GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: mutation,
      variables: {
        postId,
        content,
        author: name,
        email,
      },
    }),
  });

  return NextResponse.json(await res.json());
}
