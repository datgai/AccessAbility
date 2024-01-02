import fs from 'fs';
import multer from 'multer';
import path from 'path';

export class FileTypeError extends Error {}

export const MAX_UPLOAD_SIZE = 5; // in MiB
export const UPLOADS_FOLDER = 'uploads';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_SIZE * 1024 * 1024 // 5 MiB
  },
  fileFilter: (_, file, callback) => {
    const filetypes = /jpeg|jpg|png/;
    // Check ext
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return callback(null, true);
    }

    return callback(new FileTypeError('Only images are allowed.'));
  }
});

// Used to actually get the path of destination
const getPath = (defaultFilePath: string, folder: string | undefined) => {
  const fileName = path.basename(defaultFilePath);
  let filePath: string;

  if (!folder) {
    filePath = path.join(__dirname, '..', '..', UPLOADS_FOLDER);
  } else {
    filePath = path.join(__dirname, '..', '..', UPLOADS_FOLDER, folder);
  }

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }

  return path.join(filePath, fileName);
};

// Used to avoid duplicated file name when using fs.rename
export const getFilePath = (
  targetPath: string,
  folder: string | undefined,
  increment: number = 1
): string => {
  const defaultPath = getPath(targetPath, folder);
  if (!fs.existsSync(defaultPath)) return defaultPath;

  const fileName = `${path.basename(defaultPath, path.extname(defaultPath))}${
    `_${increment}` || ''
  }${path.extname(defaultPath)}`;

  const filePath = getPath(fileName, folder);

  if (fs.existsSync(filePath))
    return getFilePath(defaultPath, folder, increment + 1);
  return filePath;
};

export const saveImage = (
  baseUrl: string,
  folder: string,
  avatarBuffer: Buffer,
  originalName: string,
  callback: (error: NodeJS.ErrnoException | null, avatarUrl: string) => void
) => {
  const targetPath = getFilePath(
    path.join(__dirname, '..', '..', UPLOADS_FOLDER, originalName),
    folder
  );
  const fileName = path.basename(targetPath);

  fs.writeFile(targetPath, avatarBuffer, (err) => {
    if (err) return callback(err, '');
    return callback(null, `${baseUrl}/${UPLOADS_FOLDER}/${folder}/${fileName}`);
  });
};
