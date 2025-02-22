import * as fs from 'fs';
import * as gfs from 'graceful-fs';
import * as path from 'path';
import typescriptParser from 'prettier/parser-typescript';
import * as prettier from 'prettier/standalone';
import * as util from 'util';

gfs.gracefulify(fs);

const readfileFromFS = util.promisify(fs.readFile);
const writeFileToFS = util.promisify(fs.writeFile);

const fileComment = '/* 🤖 this file was generated by svg-to-ts */\n';

export const extractSvgContent = async (filePath: string): Promise<string> => {
  const fileContentRaw = await readfileFromFS(filePath, 'utf-8');
  return fileContentRaw.replace(/\r?\n|\r/g, ' ');
};

export const writeFile = async (outputDirectory: string, fileName: string, fileContent: string): Promise<void> => {
  const formattedFileContent = formatContent(`${fileComment}${fileContent}`);
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }
  await writeFileToFS(path.join(outputDirectory, `${fileName}.ts`), formattedFileContent);
};

export const readFile = async (filePath: string): Promise<string> => {
  return readfileFromFS(filePath, 'utf-8');
};

export const deleteFolder = async (directoryPath: string) => {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((filePath: string) => {
      const curPath = directoryPath + '/' + filePath;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
  }
};

export const deleteFiles = (filePaths: string[]): void => {
  filePaths.forEach((filePath: string) => fs.unlinkSync(filePath));
};

const formatContent = (fileContent: string) =>
  prettier.format(fileContent, {
    parser: 'typescript',
    plugins: [typescriptParser],
    singleQuote: true
  });
