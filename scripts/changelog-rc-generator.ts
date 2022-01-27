import fs from "fs";
import prettier from "prettier";
import { startCase, padStart } from "lodash";
import { getPackages } from "@manypkg/get-packages";
import { NewChangeset, ComprehensiveRelease } from "@changesets/types";
import { readPreState } from "@changesets/pre";
import { read } from "@changesets/config";
import readChangesets from "@changesets/read";
import assembleReleasePlan from "@changesets/assemble-release-plan";

interface GetReleaseSummaryProp {
  changesets: NewChangeset[];
  release: ComprehensiveRelease;
}

class ChangelogRCGenerator {
  private repPkg = "@wallace-changesets-example/one";
  private docsPkg = "@wallace-changesets-example/docs";
  private cwd: string = "";

  constructor() {
    this.init();
  }

  private init = () => {
    this.cwd = process.cwd();
    if (!this.cwd) throw new Error("There is no CWD path");
  };

  private getCurrentDate = () => {
    const data = new Date();
    const day = padStart(data.getDate().toString(), 2, "0");
    const month = padStart((data.getMonth() + 1).toString(), 2, "0");
    const year = data.getFullYear();

    return `## ${year}-${month}-${day}`;
  };

  private getPackageName = (name: string) => {
    return startCase(name.replace("@wallace-changesets-example/", ""));
  };

  private getReleaseSummary = (props: GetReleaseSummaryProp) => {
    const { changesets, release } = props;

    const formattedChangesets = release.changesets.map((changeset) => {
      const { summary } = changesets.find((cs) => cs.id === changeset) ?? {};
      return !summary || summary?.trim().startsWith("-")
        ? summary
        : `- ${summary} \n`;
    });

    /* 
      @example: **@wallace-changesets-example/a** `v.0.1.1`
    */
    const subPackageName = `**${this.getPackageName(release.name)}** \`v${
      release.newVersion
    }\``;

    /* 
      @example: `@wallace-changesets-example/a@0.1.1`
    */
    const rootPackageName = `\`${this.repPkg}@${release.newVersion}\``;

    const displayName =
      release.name === this.repPkg ? rootPackageName : subPackageName;

    return {
      ...release,
      changesets: formattedChangesets,
      displayName: displayName.replace(/,\s*$/, ""),
    };
  };

  private getChangesetEntries = async () => {
    const packages = await getPackages(this.cwd);
    const preState = await readPreState(this.cwd);
    const changesetConfig = await read(this.cwd, packages);
    const changesets = await readChangesets(this.cwd);

    const releasePlan = assembleReleasePlan(
      changesets,
      packages,
      changesetConfig,
      preState
    );

    /**
     * @example
     * ```typescript
     * [
     *  ...
     *    {
     *      name: '@wallace-changesets-example/package-one',
     *      type: 'patch',
     *      oldVersion: '0.1.2',
     *      changesets: [ '- patch bump \n' ],
     *      newVersion: '0.1.3',
     *      displayName: '**Package One** `v0.1.3`'
     *    },
     *  ...
     * ]
     * ```
     */
    const releases = releasePlan.releases
      .filter((release) => release.changesets.length > 0)
      .filter((release) => release.name !== this.docsPkg)
      .map((release) =>
        this.getReleaseSummary({ changesets: releasePlan.changesets, release })
      )
      .sort((a, b) => {
        if (a.name === this.repPkg) return -1;
        if (b.name === this.repPkg) return 1;
        return 0;
      });

    return releases;
  };

  public run = async () => {
    const releases = await this.getChangesetEntries();

    /**
     *  @example
     *  ```typescript
     *    [
     *      '**Package One** `v0.1.4`\n\n- patch bump \n',
     *      '**Package Two** `v0.1.4`\n\n- patch bump \n'
     *    ]
     *  ```
     */
    const releaseEntries = releases.map((release) =>
      [release.displayName, "\n\n", ...release.changesets].join("")
    );
    let content = [this.getCurrentDate(), ...releaseEntries].join("\n\n");
    content = prettier.format(content, {
      parser: "markdown",
      printWidth: 80,
      singleQuote: true,
      trailingComma: "es5",
    });

    fs.writeFileSync(`${this.cwd}/.changelogrc`, content);
  };
}

const changelogRCGenerator = new ChangelogRCGenerator();
changelogRCGenerator.run();
