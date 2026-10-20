import Nav from "./Nav";
import RestingOutlineWord from "./RestingOutlineWord";

/** Server wrapper so the resting nav letters are not part of the client graph. */
export default function NavFrame() {
  return (
    <Nav
      words={{
        Work: <span>Work</span>,
        Archive: <span>Archive</span>,
        About: <span>About</span>,
      }}
    />
  );
}
