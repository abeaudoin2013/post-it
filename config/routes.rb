Rails.application.routes.draw do

  devise_for :users

  resources :posts
  put "/update_order", to: "posts#update_order"

  root 'posts#index'

end
