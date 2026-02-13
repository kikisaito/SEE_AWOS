class Evaluation {
  final int id;
  final String description;

  Evaluation({required this.id, required this.description});

  factory Evaluation.fromJson(Map<String, dynamic> json) {
    return Evaluation(
      id: json['id'] as int,
      description: json['description'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'description': description};
  }

  Evaluation copyWith({int? id, String? description}) {
    return Evaluation(
      id: id ?? this.id,
      description: description ?? this.description,
    );
  }
}
