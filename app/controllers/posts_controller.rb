class PostsController < ApplicationController
  
  before_action :authenticate_user!
  before_action :set_user

  def index

    # return posts based on their order, a column I have made in the database

    @posts = @user.posts.order(:order)
    @last_post = @posts.order(:created_at).last

    # All of our actions take place on the index page, including making new posts
    @post = Post.new

    respond_to do |format|
      format.html
      format.json { render :json => {all_posts: @posts,
                                     last_post: @last_post }}
                                     # respond with json so that we can handle the output with javascript
    end
  end

  def create

    # the params come in from AJAX

  	@post = Post.new(post_params)

    if @post.save

      render :nothing => true

    else

      render :nothing => true

    end

  end

  def update

    # update the post (again, ajax)

    @post = Post.update(params["id"], post_params)
    p "Updated post number #{@post.id}"
    render :nothing => true
  end

  def update_order

    # once again, ajax

    # Post.parse is a method on the Post model

    ids = Post.parse(params["ids"])

    ids.each do |id|
      # find a post by id
      post = Post.find(id)
      # then save its order column = to the id's index number in the ids array
      post.order = ids.index(id)
      post.save!
    end

    render :nothing => true
  end

  def destroy
    post = Post.find(params["id"])

    post.destroy

    render :nothing => true
  end

  private

  def set_user
    @user = current_user
  end

  def post_params
    params.require(:post).permit(:content, :background, :order).merge(user: current_user)
  end
end
