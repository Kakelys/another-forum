import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Page } from "src/shared/page.model";

@Injectable()
export class TopicService {

  private baseURL = 'http://localhost:5000/api/v1/topics';

  constructor(
    private http: HttpClient,
  ) {}

  getTopic(topicId) {
    return this.http.get(`${this.baseURL}/${topicId}`);
  }

  getPostsPage(topicId, page: Page) {
    return this.http.get(`${this.baseURL}/${topicId}/posts`, {params: {...page}});
  }

  createTopic(topic) {
    return this.http.post(this.baseURL, topic);
  }
}
