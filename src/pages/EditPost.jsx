import { useState, useEffect } from "react";
import service from "../Appwrite/config";
import { Container, PostForm } from "../components";
import { useParams, useNavigate } from "react-router-dom";

function EditPost() {
  const [post, setPost] = useState(null);
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      service.getPost(slug).then((post) => {
        if (post) {
          setPost(post);
        }
      });
    } else {
      navigate("/");
    }
  }, [slug, navigate]);

  return post ? (
    <Container>
      <PostForm post={post} />
    </Container>
  ) : null;
}

export default EditPost;
