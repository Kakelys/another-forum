import { NgForm } from '@angular/forms';
import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from '../services/chat.service';
import { MessageResponse } from '../models/message-response.model';
import { Offset } from 'src/shared/offset.model';
import { ToastrExtension } from 'src/shared/toastr.extension';
import { HttpException } from 'src/shared/models/http-exception.model';
import { NgFormExtension } from 'src/shared/ng-form.extension';
import { ChatInfo } from '../models/chat-info.model';
import { environment as env } from 'src/environments/environment';
import { ReplaySubject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/shared/models/user.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  user: User;

  chatId: number;
  chat: ChatInfo;
  messages: MessageResponse[] = [];

  chatName: string;
  profileId: number;

  loadTime: Date = new Date();
  canLoadMore = true;
  messageLimit = 50;

  limitNames = env.limitNames;

  message: string;

  private destroy$ = new ReplaySubject<boolean>(1);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private chatService: ChatService,
    private auth: AuthService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.handleChatId(params["id"]);
    })

    this.auth.user$.pipe(takeUntil(this.destroy$))
    .subscribe((user: User) => {
      this.user = user;
    })
  }

  async handleChatId(chatId) {
    let newChatId = chatId

    if(!Number(newChatId)) {
      this.toastr.error("Wrong chat id");
      this.router.navigate(['/chats']);

      return;
    }

    if(newChatId == this.chatId)
      return;

    this.chatId = newChatId;
    this.chatService.currentChat$.next(this.chatId);

    this.setDefaults();
    this.loadChatInfo();
  }

  loadMessages() {
    if(!this.canLoadMore)
      return;

    const additionalOffset = this.messages.filter(c => c.message.createdAt > this.loadTime).length;
    const offset = new Offset(this.messages.length + additionalOffset, this.messageLimit);

    this.chatService.getMessages(this.chatId, offset, this.loadTime)
    .subscribe({
      next: (msgs: MessageResponse[]) => {
        if(!msgs || msgs.length < this.messageLimit)
        {
          this.canLoadMore = false;
        }
        this.messages.push(...msgs);
      },
      error: (err: HttpException) =>
        ToastrExtension.handleErrors(this.toastr, err.errors)
    })
  }

  loadChatInfo() {
    this.chatService.getChat(this.chatId).subscribe({
      next: (chat: ChatInfo) => {
        this.chat = chat;
        if(chat.chat.isGroup)
        {
          this.chatName = chat.chat.title;
        }
        else
        {
          const anotherUser = chat.members.find(m => m.id != this.user.id);
          this.profileId = anotherUser?.id ?? this.user.id;
          this.chatName = anotherUser?.username ?? "Saved Messages";
        }

        this.loadMessages();
      },
      error: (err: HttpException) =>
        ToastrExtension.handleErrors(this.toastr, err.errors)
    })
  }

  onSendMessage(form: NgForm) {
    if(form.invalid) {
      NgFormExtension.markAllAsTouched(form)
      return;
    }

    this.chatService.sendMessage(this.chatId, form.value.content)
    .subscribe({
      next: (msg: MessageResponse) => {
        this.messages.unshift(msg)
        form.reset();
      },
      error: (err: HttpException) =>
        ToastrExtension.handleErrors(this.toastr, err.errors)
    });
  }

  onKeyDown(event: KeyboardEvent, form: NgForm) {
    if(event.key == 'Enter')
    {
      event.preventDefault();
      if(event.shiftKey)
      {
        this.message += "\n"
      }
      else
      {
        this.onSendMessage(form);
        form.reset();
      }
    }

  }

  setDefaults() {
    this.chat = null;
    this.messages = [];

    this.canLoadMore = true;
    this.loadTime = new Date();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();

    this.chatService.currentChat$.next(null);
  }
}