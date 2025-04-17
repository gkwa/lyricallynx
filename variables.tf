variable "bucket_name" {
  description = "Name of the S3 bucket for website hosting"
  type        = string
  default     = "lyricallynx"
}

variable "region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}
