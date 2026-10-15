import Nav from "./Nav";
import RestingOutlineWord from "./RestingOutlineWord";

/** Server wrapper so the resting nav letters are not part of the client graph. */
export default function NavFrame() {
  return (
    <Nav
      words={{
        work: <RestingOutlineWord label="work" />,
        archive: <RestingOutlineWord label="archive" />,
        about: <RestingOutlineWord label="about" />,
      }}
    />
  );
}
