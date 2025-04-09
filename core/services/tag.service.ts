import { TagRepository } from '../repositories/tag.repository';
import { CreateTagDTO, TagFilter, TagResponse, TagsResponse, UpdateTagDTO, toTagResponse, toTagsResponse, TagCount } from '../models/tag.model';

export class TagService {
  private tagRepository: TagRepository;

  constructor() {
    this.tagRepository = new TagRepository();
  }

  /**
   * 獲取所有標籤並包含文章數量
   */
  async getAllTags(filter?: TagFilter): Promise<TagsResponse> {
    try {
      const tags = await this.tagRepository.findAll(filter);
      const postCounts = await this.tagRepository.getPostCounts();
      
      return {
        success: true,
        data: tags,
        postCounts
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '獲取標籤失敗'
      };
    }
  }

  /**
   * 獲取單個標籤信息
   */
  async getTagById(id: number): Promise<TagResponse> {
    try {
      const tag = await this.tagRepository.findById(id);
      
      if (!tag) {
        return {
          success: false,
          error: '標籤不存在'
        };
      }
      
      const postCount = await this.tagRepository.getPostCountById(id);
      
      return toTagResponse(tag, postCount);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '獲取標籤失敗'
      };
    }
  }

  /**
   * 獲取標籤關聯的文章
   */
  async getTagPosts(id: number): Promise<TagResponse> {
    try {
      const tag = await this.tagRepository.findById(id);
      
      if (!tag) {
        return {
          success: false,
          error: '標籤不存在'
        };
      }
      
      const posts = await this.tagRepository.getPostsByTagId(id);
      const postCount = posts.length;
      
      return {
        success: true,
        data: tag,
        postCount,
        posts
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '獲取標籤文章失敗'
      };
    }
  }

  /**
   * 創建新標籤
   */
  async createTag(data: CreateTagDTO): Promise<TagResponse> {
    try {
      const tag = await this.tagRepository.create(data);
      
      return toTagResponse(tag);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '創建標籤失敗'
      };
    }
  }

  /**
   * 更新標籤
   */
  async updateTag(id: number, data: UpdateTagDTO): Promise<TagResponse> {
    try {
      const tag = await this.tagRepository.update(id, data);
      
      return toTagResponse(tag);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新標籤失敗'
      };
    }
  }

  /**
   * 刪除標籤
   */
  async deleteTag(id: number): Promise<TagResponse> {
    try {
      // 確認標籤存在
      const tag = await this.tagRepository.findById(id);
      
      if (!tag) {
        return {
          success: false,
          error: '標籤不存在'
        };
      }
      
      // 檢查標籤是否有關聯的文章
      const postCount = await this.tagRepository.getPostCountById(id);
      
      if (postCount > 0) {
        return {
          success: false,
          error: `無法刪除標籤，該標籤有 ${postCount} 篇關聯文章`
        };
      }
      
      await this.tagRepository.delete(id);
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '刪除標籤失敗'
      };
    }
  }

  /**
   * 獲取所有標籤的文章數量
   * @returns Promise<TagCount[]> 標籤及其文章數量列表
   */
  async getPostCounts(): Promise<TagCount[]> {
    const counts = await this.tagRepository.getPostCounts();
    const tags = await this.tagRepository.findAll();
    
    return Object.entries(counts).map(([id, count]) => {
      const tag = tags.find(t => t.id === Number(id));
      return {
        tag_id: Number(id),
        name: tag?.name || '',
        post_count: count
      };
    });
  }
} 