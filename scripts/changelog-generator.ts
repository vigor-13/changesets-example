import fs from "fs";
import prettier from "prettier";
import { getPackages } from "@manypkg/get-packages";
import { readPreState } from "@changesets/pre";
import { read } from "@changesets/config";
import readChangesets from "@changesets/read";

class ChangelogGenerator {
  private onePkg = "@wallace-changesets-example/one";
  private docsPkg = "@wallace-changesets-example/docs";
  private cwd: string = "";

  constructor() {
    this.init();
  }

  private getChangesetEntries = async () => {
    const packages = await getPackages(this.cwd);
    const preState = await readPreState(this.cwd);
    const changesetConfig = await read(this.cwd, packages);
    const changesets = await readChangesets(this.cwd);

    console.log(changesets);
  };

  private init = () => {
    this.cwd = process.cwd();
    if (!this.cwd) throw new Error("There is no CWD path");
  };

  public run = async () => {
    const releases = await this.getChangesetEntries();
  };
}

const changelogGenerator = new ChangelogGenerator();
changelogGenerator.run();
