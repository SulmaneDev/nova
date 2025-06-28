import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';
import { Logger, LogPayload } from '../../src/foundation/logger';

let existsSyncSpy: jest.SpyInstance;
let mkdirSyncSpy: jest.SpyInstance;
let createWriteStreamSpy: jest.SpyInstance;
let pathJoinSpy: jest.SpyInstance;

const mockWrite = jest.fn();
const mockStream = { write: mockWrite } as unknown as Writable;

beforeEach(() => {
    mockWrite.mockReset();

    existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    createWriteStreamSpy = jest.spyOn(fs, 'createWriteStream').mockReturnValue(mockStream);

    pathJoinSpy = jest.spyOn(path, 'join').mockImplementation((...args: string[]) => args.join('/'));
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Logger', () => {
    it('should create log directory if it does not exist', () => {
        new Logger('./logs');
        expect(fs.existsSync).toHaveBeenCalledWith('./logs');
        expect(fs.mkdirSync).toHaveBeenCalledWith('./logs', { recursive: true });
    });

    it('should not create directory if it already exists', () => {
        existsSyncSpy.mockReturnValue(true);
        new Logger('./logs');
        expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should write a basic log entry to file', async () => {
        const logger = new Logger('./logs');
        await logger.info('Hello', { user: 'sulman' });

        expect(mockWrite).toHaveBeenCalledWith(expect.stringContaining('INFO: Hello | {"user":"sulman"}\n'));
    });

    it('should skip context if not provided', async () => {
        const logger = new Logger('./logs');
        await logger.info('Hello');

        expect(mockWrite).toHaveBeenCalledWith(expect.stringMatching(/INFO: Hello\n$/));
    });

    it('should support pipe classes modifying payloads', async () => {
        const pipe = {
            handle: jest.fn(async (payload: LogPayload, next: any) => {
                payload.message = 'modified';
                await next(payload);
            }),
        };

        const logger = new Logger();
        logger.pipeThrough([pipe]);
        await logger.error('original');

        expect(mockWrite).toHaveBeenCalledWith(expect.stringContaining('ERROR: modified'));
    });

    it('should support function-style pipes', async () => {
        const pipeFn = jest.fn(async (payload: LogPayload, next: any) => {
            payload.message = payload.message.toUpperCase();
            await next(payload);
        });

        const logger = new Logger();
        logger.pipeThrough([pipeFn]);
        await logger.notice('lowercase');

        expect(mockWrite).toHaveBeenCalledWith(expect.stringContaining('NOTICE: LOWERCASE'));
    });

    it('should support all log levels', async () => {
        const logger = new Logger();

        await logger.info('info');
        await logger.error('error');
        await logger.warning('warn');
        await logger.debug('debug');
        await logger.notice('note');

        const calls = mockWrite.mock.calls.map((c) => c[0]);
        expect(calls.some((c) => c.includes('INFO: info'))).toBeTruthy();
        expect(calls.some((c) => c.includes('ERROR: error'))).toBeTruthy();
        expect(calls.some((c) => c.includes('WARNING: warn'))).toBeTruthy();
        expect(calls.some((c) => c.includes('DEBUG: debug'))).toBeTruthy();
        expect(calls.some((c) => c.includes('NOTICE: note'))).toBeTruthy();
    });
});
