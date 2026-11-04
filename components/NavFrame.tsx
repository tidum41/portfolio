import Nav from "./Nav";
import RestingOutlineWord from "./RestingOutlineWord";

/** Server wrapper so the resting nav letters are not part of the client graph. */
export default function NavFrame() {
  return (
    <Nav
      words={{
        Work: <RestingOutlineWord label="Work" />,
        Archive: <RestingOutlineWord label="Archive" />,
        About: <RestingOutlineWord label="About" />,
      }}
    />
  );
}
