import fs from "fs";
import path from "path";

function readHtml(relPath: string) {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

export default function Page() {
  const header = readHtml("clone-kit/html/01-header.html");
  const main = readHtml("clone-kit/html/02-main.html");
  const footer = readHtml("clone-kit/html/03-footer.html");

  return (
    <div id="page" className="site">
      <div dangerouslySetInnerHTML={{ __html: header }} />
      <div dangerouslySetInnerHTML={{ __html: main }} />
      <div dangerouslySetInnerHTML={{ __html: footer }} />
    </div>
  );
}
