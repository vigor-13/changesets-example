import fs from "fs";

interface ChnagelogMDGeneratorProps {
  markdownPath?: string;
  changelogrcPath?: string;
}

class ChangelogMDGenerator {
  private cwd: string = "";
  private mdPath: string = "";
  private rcPath: string = "";

  constructor(
    props: ChnagelogMDGeneratorProps = {
      markdownPath: "",
      changelogrcPath: "",
    }
  ) {
    this.init(props);
  }

  private init = async (props: ChnagelogMDGeneratorProps) => {
    this.cwd = process.cwd();
    if (!this.cwd) throw new Error("There is no CWD path");

    this.mdPath = `${this.cwd}/CHANGELOG.md`;
    if (props.markdownPath) this.mdPath = `${this.cwd}/${props.markdownPath}`;

    this.rcPath = `${this.cwd}/.changeset/.changelogrc`;
    if (props.changelogrcPath)
      this.mdPath = `${this.cwd}/${props.changelogrcPath}`;
  };

  public run = async () => {
    const rcContent = await fs.readFileSync(this.rcPath).toString();
    if (!rcContent) throw new Error("There is no .changelogrc");

    const prevMD = await fs.promises.readFile(this.mdPath, "utf8");
    const nextMD = prevMD.replace(
      "<!-- CHANGELOG:INSERT -->",
      `<!-- CHANGELOG:INSERT -->\n\n${rcContent}`
    );

    await fs.promises.writeFile(this.mdPath, nextMD);
  };
}

const changelogMDGenerator = new ChangelogMDGenerator();
changelogMDGenerator.run();
