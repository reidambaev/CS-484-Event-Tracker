import { useEffect, useState } from "react";
import supabase from "../utils/supabase";

type Tag = {
  tag_id: number;
  name: string;
  isFollowed: boolean;
};

function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) setUserId(user.id);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function loadTags() {
      setLoading(true);
      
      const { data: tags, error } = await supabase
      .from("tags")
      .select("id, name");
      if(error){
        console.log(error)
        setLoading(false);
        return;
      }

      const { data: followed, error: err} = await supabase
        .from("followed_tags")
        .select("tag_id")
        .eq("user_id", userId);
        if(err){
            console.log(err);
            setLoading(false);
            return;
        }

      const followedIds = new Set(followed?.map(f => f.tag_id));

      //make mapping of tags that appear in user_tags to see which is followed
      setTags(
        tags?.map(tag => ({
          tag_id: tag.id, 
          name: tag.name,
          isFollowed: followedIds.has(tag.id), 
        })) ?? []
      );

      setLoading(false);
    }

    loadTags();
  }, [userId]);


  async function tagClicked(tag: Tag) {
    if (!userId) return;

    //In charge of making sure tags are mapped correctly when clicked
    setTags(prevTags => {
      const update_tags = prevTags.map(currentTag => {
        //Flips isFollowed to opposite value when clicked
        if (currentTag.tag_id === tag.tag_id){
            return{
                ...currentTag,
                isFollowed: !currentTag.isFollowed,
            };
        }
        return currentTag
      });
      return update_tags
    });

    //followed, delete from db
    if (tag.isFollowed) {
      await supabase
        .from("followed_tags")
        .delete()
        .eq("user_id", userId)
        .eq("tag_id", tag.tag_id);
    //not followed, add to db
    } else {
      await supabase
        .from("followed_tags")
        .insert({ user_id: userId, tag_id: tag.tag_id }); 
    }
  }

  if (!userId) return <div>Please log in to follow tags</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
        <h1 style={{ fontSize: "48px", textAlign:"center"}}>
        Event Tags
        </h1>
        <span style={{margin: "12px", border: "2px solid black ", padding: "5px", display: "inline-block",marginBottom: "16px"}}>
        <span
        style={{
        display: "inline-block",
        width: "24px",
        height: "24px",
        backgroundColor: "#06f10eff", 
        margin: "0 8px",
        verticalAlign: "middle",
        }}
        ></span>
        Tag Followed
        <span
        style={{
        display: "inline-block",
        width: "24px",
        height: "24px",
        backgroundColor: "#ea1616ff", 
        margin: "0 8px",
        verticalAlign: "middle",
        }}
        ></span>
        Tag Not Followed
        </span>

    <div>

      {tags.map(tag => (
        <button
          key={tag.tag_id}
          onClick={() => tagClicked(tag)}
          style={{
            margin: "12px",
            padding: "8px 48px",
            background: tag.isFollowed ? "#06f10eff" : "#ea1616ff",
            color: tag.isFollowed ? "#fff" : "#000",
            borderRadius: "64px",
          }}
        >
          {tag.name}
        </button>
      ))}
    </div>
    </div>
  );
}

export default Tags;