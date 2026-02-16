class Capsule {
  final String id;
  final String title;
  final String content;
  final int emotionId;
  final bool isActive;

  Capsule({
    required this.id,
    required this.title,
    required this.content,
    required this.emotionId,
    required this.isActive,
  });

  factory Capsule.fromJson(Map<String, dynamic> json) {
    return Capsule(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      emotionId: json['emotion_id'] as int,
      isActive: json['is_active'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'emotion_id': emotionId,
      'is_active': isActive,
    };
  }

  Capsule copyWith({
    String? id,
    String? title,
    String? content,
    int? emotionId,
    bool? isActive,
  }) {
    return Capsule(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      emotionId: emotionId ?? this.emotionId,
      isActive: isActive ?? this.isActive,
    );
  }
}
