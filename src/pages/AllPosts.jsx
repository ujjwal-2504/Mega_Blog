import { useState, useEffect } from "react";
import service from "../Appwrite/config";
import { Container, Postcard } from "../components";

function AllPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    service.getPosts().then((posts) => {
      if (posts) {
        setPosts(posts.documents);
      }
    });
  }, []);

  return (
    <div className="w-full py-8">
      <Container>
        <div className="flex flex-wrap">
          {posts.map((post) => {
            return (
              <div className="p-2 w-1/4" key={post.$id}>
                <Postcard post={post} />
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}

export default AllPosts;
