import fs from "fs";

class ChangelogMDWriter {
  private cwd: string = "";
  private rawChangelogContent: string = "";
  private mdPath: string = "";

  constructor() {
    this.init();
  }

  private init = async () => {
    this.cwd = process.cwd();
    if (!this.cwd) throw new Error("There is no CWD path");

    this.mdPath = `${this.cwd}/CHANGELOG.md`;

    this.rawChangelogContent = await fs
      .readFileSync(`${this.cwd}/.changeset/.changelogrc`)
      .toString();
    if (!this.rawChangelogContent) throw new Error("There is no .changelogrc");
  };

  public run = async () => {
    const prevMDChangelog = await fs.promises.readFile(this.mdPath, "utf8");
    const nextMDChangelog = prevMDChangelog.replace(
      "<!-- CHANGELOG:INSERT -->",
      `<!-- CHANGELOG:INSERT -->\n\n${this.rawChangelogContent}`
    );

    await fs.promises.writeFile(this.mdPath, nextMDChangelog);
  };
}

const changelogMDWriter = new ChangelogMDWriter();
changelogMDWriter.run();
