import Nav from "./Nav";
import RestingOutlineWord from "./RestingOutlineWord";

/** Server wrapper so the resting nav letters are not part of the client graph. */
export default function NavFrame() {
  const word = (label: "Work" | "Archive" | "About") => <RestingOutlineWord label={label} />;
  return (
    <Nav
      words={{
        Work: word("Work"),
        Archive: word("Archive"),
        About: word("About"),
      }}
    />
  );
}
