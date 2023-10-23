import { Component, OnDestroy } from '@angular/core';
import { Topic } from '../../models/topic.model';
import { User } from 'src/shared/models/user.model';
import { AuthService } from 'src/app/auth/auth.service';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { Forum } from '../../models/forum.model';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnDestroy {
  topics: Topic[] = [];
  forum: Forum = null;

  user: User = null;
  private destroy$ = new ReplaySubject<boolean>(1);

  forumId: number = 0;
  currentPage: number = 1;
  topicsOnPage: number = 5;

  showNewTopic: boolean = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private forumService: ForumService) {

    authService.user$.pipe(takeUntil(this.destroy$))
      .subscribe(user => {this.user = user;})

    route.params.subscribe(async params => {
      this.handleForumIdChange(params['id']);
      this.handlePageChange(params['page']);
    });
  }

  async handleForumIdChange(newForumId: number) {
    if(+newForumId) {
      if(this.forumId == newForumId) {
        return;
      }
      this.forumId = newForumId;

      this.forumService.getForum(this.forumId)
        .subscribe((forum: Forum) => {
          this.forum = forum;
        });

      this.loadTopicsPage(this.currentPage);
    }
  }

  async handlePageChange(newPage: number) {
    if(+newPage) {
      if(this.currentPage == newPage) {
        return;
      }

      this.currentPage = newPage;
      this.loadTopicsPage(this.currentPage);
    }
  }

  changePage(page: number) {
    this.router.navigate(['../', page], {relativeTo: this.route})
  }

  toggleNewTopic() {
    this.showNewTopic = !this.showNewTopic;
  }

  loadTopicsPage(page: number) {
    this.forumService
      .getForumTopics(this.forumId, {pageNumber: this.currentPage, pageSize: this.topicsOnPage})
      .subscribe((topics: Topic[]) => {
        this.topics = topics;
      });
  }

  onEdit(data) {
    this.forumService.updateForum(this.forum.id, data)
      .subscribe({
        next: (forum:any) => {
          this.forum.title = forum.title;
        }
      })
  }

  onDelete() {
    this.forumService.deleteForum(this.forum.id).subscribe({
      next: () => {
        this.router.navigate(['../../'], {relativeTo: this.route});
      }
    })
  }

  onCreated() {
    this.toggleNewTopic();
    this.loadTopicsPage(this.forum.topicsCount / this.topicsOnPage);
    this.forum.topicsCount++;
    this.forum.postsCount++;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}