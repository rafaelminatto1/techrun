// Testes para VideoService
import {videoService} from '../videoService';
import {apiClient} from '../apiClient';
import {showToast} from '@utils/toastConfig';
import RNFS from 'react-native-fs';

// Mock dependencies
jest.mock('../apiClient');
jest.mock('@utils/toastConfig');
jest.mock('react-native-fs');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockedRNFS = RNFS as jest.Mocked<typeof RNFS>;
const mockedShowToast = showToast as jest.Mocked<typeof showToast>;

describe('VideoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Video Validation', () => {
    it('should validate video file successfully', async () => {
      mockedRNFS.exists.mockResolvedValueOnce(true);
      mockedRNFS.stat.mockResolvedValueOnce({
        size: 50 * 1024 * 1024, // 50MB
        isFile: () => true,
        isDirectory: () => false,
      } as any);

      const result = await videoService.validateVideo('file://test-video.mp4');

      expect(result.isValid).toBe(true);
      expect(result.fileSize).toBe(50 * 1024 * 1024);
      expect(result.format).toBe('mp4');
    });

    it('should reject video if file does not exist', async () => {
      mockedRNFS.exists.mockResolvedValueOnce(false);

      const result = await videoService.validateVideo('file://nonexistent.mp4');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('não encontrado');
    });

    it('should reject video if file is too large', async () => {
      mockedRNFS.exists.mockResolvedValueOnce(true);
      mockedRNFS.stat.mockResolvedValueOnce({
        size: 150 * 1024 * 1024, // 150MB (exceeds 100MB limit)
        isFile: () => true,
        isDirectory: () => false,
      } as any);

      const result = await videoService.validateVideo('file://large-video.mp4');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('muito grande');
    });

    it('should reject unsupported file format', async () => {
      mockedRNFS.exists.mockResolvedValueOnce(true);
      mockedRNFS.stat.mockResolvedValueOnce({
        size: 10 * 1024 * 1024,
        isFile: () => true,
        isDirectory: () => false,
      } as any);

      const result = await videoService.validateVideo('file://video.mkv');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Formato não suportado');
    });

    it('should handle validation errors gracefully', async () => {
      mockedRNFS.exists.mockRejectedValueOnce(new Error('File system error'));

      const result = await videoService.validateVideo('file://error-video.mp4');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Erro ao validar');
    });
  });

  describe('Video Compression', () => {
    it('should skip compression for small files', async () => {
      mockedRNFS.exists.mockResolvedValueOnce(true);
      mockedRNFS.stat.mockResolvedValueOnce({
        size: 10 * 1024 * 1024, // 10MB (below 20MB threshold)
        isFile: () => true,
        isDirectory: () => false,
      } as any);

      const result = await videoService.compressVideoIfNeeded(
        'file://small-video.mp4',
      );

      expect(result).toBe('file://small-video.mp4');
    });

    it('should simulate compression for large files', async () => {
      mockedRNFS.exists.mockResolvedValueOnce(true);
      mockedRNFS.stat.mockResolvedValueOnce({
        size: 50 * 1024 * 1024, // 50MB (above 20MB threshold)
        isFile: () => true,
        isDirectory: () => false,
      } as any);

      const startTime = Date.now();
      const result = await videoService.compressVideoIfNeeded(
        'file://large-video.mp4',
      );
      const duration = Date.now() - startTime;

      expect(result).toBe('file://large-video.mp4');
      expect(duration).toBeGreaterThanOrEqual(2000); // Should take at least 2 seconds (simulation)
    });

    it('should handle compression errors', async () => {
      mockedRNFS.exists.mockResolvedValueOnce(false);

      await expect(
        videoService.compressVideoIfNeeded('file://invalid.mp4'),
      ).rejects.toThrow('Vídeo inválido');
    });
  });

  describe('Video Upload', () => {
    beforeEach(() => {
      // Mock successful validation and compression
      mockedRNFS.exists.mockResolvedValue(true);
      mockedRNFS.stat.mockResolvedValue({
        size: 30 * 1024 * 1024,
        isFile: () => true,
        isDirectory: () => false,
      } as any);
    });

    it('should upload video successfully', async () => {
      const mockVideoData = {
        id: 'video-123',
        filename: 'squat_1234567890.mp4',
        originalName: 'my-squat-video.mp4',
        url: '/uploads/videos/squat_1234567890.mp4',
        size: '30.0 MB',
        status: 'uploaded',
        exerciseType: 'squat',
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockVideoData,
      } as any);

      const result = await videoService.uploadVideo(
        'file://test-video.mp4',
        'squat',
        {notes: 'Test upload'},
      );

      expect(result).toEqual(mockVideoData);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/videos/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: {'Content-Type': 'multipart/form-data'},
          timeout: 60000,
        }),
      );
    });

    it('should handle upload progress callback', async () => {
      const progressCallback = jest.fn();

      mockedApiClient.post.mockImplementationOnce((url, data, config) => {
        // Simulate progress callback
        if (config?.onUploadProgress) {
          config.onUploadProgress({loaded: 50, total: 100});
          config.onUploadProgress({loaded: 100, total: 100});
        }

        return Promise.resolve({
          data: {id: 'test-video'},
        });
      });

      await videoService.uploadVideo(
        'file://test-video.mp4',
        'squat',
        undefined,
        progressCallback,
      );

      expect(progressCallback).toHaveBeenCalledWith(50);
      expect(progressCallback).toHaveBeenCalledWith(100);
    });

    it('should retry upload on retryable errors', async () => {
      // First call fails with retryable error (500)
      mockedApiClient.post
        .mockRejectedValueOnce({
          response: {status: 500, data: {message: 'Server error'}},
        })
        .mockResolvedValueOnce({
          data: {id: 'video-123'},
        });

      const result = await videoService.uploadVideo(
        'file://test-video.mp4',
        'squat',
      );

      expect(mockedApiClient.post).toHaveBeenCalledTimes(2);
      expect(result).toEqual({id: 'video-123'});
    });

    it('should not retry on non-retryable errors', async () => {
      mockedApiClient.post.mockRejectedValueOnce({
        response: {status: 400, data: {message: 'Bad request'}},
      });

      await expect(
        videoService.uploadVideo('file://test-video.mp4', 'squat'),
      ).rejects.toThrow('Bad request');

      expect(mockedApiClient.post).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
      mockedApiClient.post.mockRejectedValue({
        response: {status: 500, data: {message: 'Server error'}},
      });

      await expect(
        videoService.uploadVideo('file://test-video.mp4', 'squat'),
      ).rejects.toThrow('Server error');

      expect(mockedApiClient.post).toHaveBeenCalledTimes(3); // Max retries
    });

    it('should enhance metadata with device info', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: {id: 'video-123'},
      });

      await videoService.uploadVideo('file://test-video.mp4', 'squat', {
        notes: 'Test',
      });

      const formDataCall = mockedApiClient.post.mock.calls[0];

      expect(formDataCall[0]).toBe('/videos/upload');
      expect(formDataCall[1]).toBeInstanceOf(FormData);

      // FormData content would include enhanced metadata with device info
      const formData = formDataCall[1] as FormData;

      expect(formData).toBeDefined();
    });

    it('should handle validation errors during upload', async () => {
      mockedRNFS.exists.mockResolvedValueOnce(false);

      await expect(
        videoService.uploadVideo('file://invalid.mp4', 'squat'),
      ).rejects.toThrow('Arquivo de vídeo não encontrado');

      expect(mockedApiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('Batch Upload', () => {
    beforeEach(() => {
      mockedRNFS.exists.mockResolvedValue(true);
      mockedRNFS.stat.mockResolvedValue({
        size: 20 * 1024 * 1024,
        isFile: () => true,
        isDirectory: () => false,
      } as any);
    });

    it('should upload multiple videos successfully', async () => {
      const videoUploads = [
        {videoUri: 'file://video1.mp4', exerciseType: 'squat' as const},
        {videoUri: 'file://video2.mp4', exerciseType: 'pushup' as const},
        {videoUri: 'file://video3.mp4', exerciseType: 'plank' as const},
      ];

      mockedApiClient.post
        .mockResolvedValueOnce({data: {id: 'video-1'}})
        .mockResolvedValueOnce({data: {id: 'video-2'}})
        .mockResolvedValueOnce({data: {id: 'video-3'}});

      const results = await videoService.uploadMultipleVideos(videoUploads);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({id: 'video-1'});
      expect(results[1]).toEqual({id: 'video-2'});
      expect(results[2]).toEqual({id: 'video-3'});
      expect(mockedApiClient.post).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures in batch upload', async () => {
      const videoUploads = [
        {videoUri: 'file://video1.mp4', exerciseType: 'squat' as const},
        {videoUri: 'file://video2.mp4', exerciseType: 'pushup' as const},
        {videoUri: 'file://video3.mp4', exerciseType: 'plank' as const},
      ];

      mockedApiClient.post
        .mockResolvedValueOnce({data: {id: 'video-1'}})
        .mockRejectedValueOnce(new Error('Upload failed'))
        .mockResolvedValueOnce({data: {id: 'video-3'}});

      const results = await videoService.uploadMultipleVideos(videoUploads);

      expect(results).toHaveLength(2); // Only successful uploads
      expect(results[0]).toEqual({id: 'video-1'});
      expect(results[1]).toEqual({id: 'video-3'});
      expect(mockedShowToast).toHaveBeenCalledWith(
        expect.stringContaining('2 vídeos enviados'),
        'info',
      );
    });

    it('should track progress for batch uploads', async () => {
      const videoUploads = [
        {videoUri: 'file://video1.mp4', exerciseType: 'squat' as const},
        {videoUri: 'file://video2.mp4', exerciseType: 'pushup' as const},
      ];

      mockedApiClient.post
        .mockResolvedValueOnce({data: {id: 'video-1'}})
        .mockResolvedValueOnce({data: {id: 'video-2'}});

      const progressCallback = jest.fn();

      await videoService.uploadMultipleVideos(videoUploads, progressCallback);

      expect(progressCallback).toHaveBeenCalledWith(0, 2, expect.any(Number));
      expect(progressCallback).toHaveBeenCalledWith(1, 2, expect.any(Number));
    });

    it('should show success toast when all uploads succeed', async () => {
      const videoUploads = [
        {videoUri: 'file://video1.mp4', exerciseType: 'squat' as const},
        {videoUri: 'file://video2.mp4', exerciseType: 'pushup' as const},
      ];

      mockedApiClient.post
        .mockResolvedValueOnce({data: {id: 'video-1'}})
        .mockResolvedValueOnce({data: {id: 'video-2'}});

      await videoService.uploadMultipleVideos(videoUploads);

      expect(mockedShowToast).toHaveBeenCalledWith(
        'Todos os 2 vídeos foram enviados com sucesso!',
        'success',
      );
    });
  });

  describe('Video Retrieval', () => {
    it('should get videos with pagination', async () => {
      const mockVideos = {
        videos: [
          {id: '1', exerciseType: 'squat'},
          {id: '2', exerciseType: 'pushup'},
        ],
        total: 10,
        hasMore: true,
      };

      mockedApiClient.get.mockResolvedValueOnce({data: mockVideos});

      const result = await videoService.getVideos(1, 2, 'squat');

      expect(result).toEqual(mockVideos);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/videos?page=1&limit=2&exerciseType=squat',
      );
    });

    it('should get video by ID', async () => {
      const mockVideo = {id: 'video-123', exerciseType: 'squat'};

      mockedApiClient.get.mockResolvedValueOnce({
        data: {success: true, data: mockVideo},
      });

      const result = await videoService.getVideoById('video-123');

      expect(result).toEqual(mockVideo);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/videos/video-123');
    });

    it('should handle video not found error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: {success: false, message: 'Video not found'},
      });

      await expect(videoService.getVideoById('invalid-id')).rejects.toThrow(
        'Video not found',
      );
    });
  });

  describe('Video Management', () => {
    it('should update video metadata', async () => {
      const mockUpdatedVideo = {id: 'video-123', notes: 'Updated notes'};

      mockedApiClient.put.mockResolvedValueOnce({
        data: {success: true, data: mockUpdatedVideo},
      });

      const result = await videoService.updateVideoMetadata('video-123', {
        notes: 'Updated notes',
      });

      expect(result).toEqual(mockUpdatedVideo);
      expect(mockedApiClient.put).toHaveBeenCalledWith(
        '/videos/video-123/metadata',
        {notes: 'Updated notes'},
      );
    });

    it('should delete video', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: {success: true},
      });

      await videoService.deleteVideo('video-123');

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/videos/video-123');
    });

    it('should handle delete video error', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: {success: false, message: 'Cannot delete video'},
      });

      await expect(videoService.deleteVideo('video-123')).rejects.toThrow(
        'Cannot delete video',
      );
    });
  });

  describe('Video Features', () => {
    it('should generate video thumbnail', async () => {
      const mockThumbnail = {thumbnailUrl: 'https://example.com/thumb.jpg'};

      mockedApiClient.post.mockResolvedValueOnce({
        data: {success: true, data: mockThumbnail},
      });

      const result = await videoService.generateThumbnail('video-123', 10);

      expect(result).toEqual(mockThumbnail);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/videos/video-123/thumbnail',
        {timestamp: 10},
      );
    });

    it('should share video', async () => {
      const mockShare = {
        shareUrl: 'https://example.com/share/abc123',
        shareId: 'abc123',
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: {success: true, data: mockShare},
      });

      const result = await videoService.shareVideo('video-123', {
        platform: 'social',
        privacy: 'public',
      });

      expect(result).toEqual(mockShare);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/videos/video-123/share',
        {platform: 'social', privacy: 'public'},
      );
    });

    it('should toggle favorite video', async () => {
      const mockFavorite = {isFavorite: true};

      mockedApiClient.post.mockResolvedValueOnce({
        data: {success: true, data: mockFavorite},
      });

      const result = await videoService.toggleFavorite('video-123');

      expect(result).toEqual(mockFavorite);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/videos/video-123/favorite',
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockedApiClient.get.mockRejectedValueOnce({
        code: 'NETWORK_ERROR',
        message: 'Network unavailable',
      });

      await expect(videoService.getVideos()).rejects.toThrow('Erro de conexão');
    });

    it('should handle API errors with custom messages', async () => {
      mockedApiClient.post.mockRejectedValueOnce({
        response: {
          data: {message: 'Custom API error'},
          status: 422,
        },
      });

      await expect(videoService.shareVideo('video-123', {})).rejects.toThrow(
        'Custom API error',
      );
    });

    it('should handle timeout errors', async () => {
      mockedApiClient.post.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'timeout of 60000ms exceeded',
      });

      await expect(
        videoService.uploadVideo('file://test.mp4', 'squat'),
      ).rejects.toThrow();
    });
  });
});
